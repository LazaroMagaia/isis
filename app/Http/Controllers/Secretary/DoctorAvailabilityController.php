<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Secretary\DoctorAvailability;
use App\Models\Secretary\DoctorAvailabilityDate;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\DoctorAvailabilitySlot;
class DoctorAvailabilityController extends Controller
{
    protected $route = 'Backend/Secretary/DoctorAvailability';
    public function index()
    {
        $search = request()->input('search'); // captura o filtro do input

        $doctor = User::where('role', 'doctor')
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_1', 'like', "%{$search}%");
                });
            })
            ->paginate(10)
            ->withQueryString(); // mantém o filtro na paginação

        return Inertia::render($this->route.'/Index', [
            'doctor' => $doctor,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
    public function show(Request $request, $id)
    {
        $doctor = User::findOrFail($id);

        // Todas as disponibilidades do médico, apenas específicas
        $availabilities = DoctorAvailability::where('doctor_id', $doctor->id)
            ->where('type', 'specific_date')
            ->orderBy('created_at')
            ->get();

        if ($availabilities->isEmpty()) {
            return Inertia::render($this->route.'/Show', [
                'doctor' => $doctor,
                'specificAvailability' => [],
                'slotDuration' => 30,
                'availability' => [],
            ]);
        }

        $availabilityForFrontend = collect();
        $specificAvailability = [];

        foreach ($availabilities as $availability) {
            $dates = DoctorAvailabilityDate::where('availability_id', $availability->id)->get();

            if ($dates->isEmpty()) continue;

            $availabilityForFrontend->push($availability);

            $minDate = $dates->min('date');
            $maxDate = $dates->max('date');

            $specificAvailability[$availability->id] = [
                'minDate' => $minDate,
                'maxDate' => $maxDate,
            ];
        }

        return Inertia::render($this->route.'/Show', [
            'doctor' => $doctor,
            'specificAvailability' => $specificAvailability,
            'slotDuration' => $availabilityForFrontend->first()->slot_duration ?? 30,
            'availability' => $availabilityForFrontend->values(),
        ]);
    }

    public function create($id)
    {
        $doctor = User::findOrFail($id);

        // Mesmo que exista disponibilidade anterior, não a enviamos
        // Isso força o React a exibir um formulário novo
        return Inertia::render($this->route . '/Create', [
            'doctor' => $doctor,
            'doctor_id' => $id,
            'availability' => null, // força criação
        ]);
    }

    public function edit($availability_id)
    {
        $availability = DoctorAvailability::with('dates')->findOrFail($availability_id);
        $doctor = User::findOrFail($availability->doctor_id);

        // Mapear apenas datas específicas
        $datas = $availability->dates->map(function ($date) {
            return [
                'data' => $date->date,
                'hora_inicio' => $date->start_time,
                'hora_fim' => $date->end_time,
            ];
        })->toArray();

        return Inertia::render($this->route . '/Edit', [
            'doctor' => $doctor,
            'availability' => [
                'id' => $availability->id,
                'type' => $availability->type,
                'datas' => $datas,
                'slot_duration' => $availability->slot_duration,
                'is_active' => $availability->is_active,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'datas' => 'required|array',
            'datas.*.data' => 'required|date',
            'datas.*.hora_inicio' => 'required|string',
            'datas.*.hora_fim' => 'required|string',
            'duracao_slot' => 'required|integer|min:5',
            'ativo' => 'boolean',
        ]);

        // Normaliza horas
        foreach ($validated['datas'] as &$d) {
            $d['hora_inicio'] = Carbon::parse($d['hora_inicio'])->format('H:i');
            $d['hora_fim'] = Carbon::parse($d['hora_fim'])->format('H:i');
        }

        DB::transaction(function () use ($validated) {
            // Cria disponibilidade
            $availability = DoctorAvailability::create([
                'doctor_id' => $validated['doctor_id'],
                'type' => 'specific_date',
                'slot_duration' => $validated['duracao_slot'],
                'is_active' => $validated['ativo'] ?? true,
            ]);

            // Cria datas e gera slots
            foreach ($validated['datas'] as $d) {
                $date = DoctorAvailabilityDate::create([
                    'availability_id' => $availability->id,
                    'date' => $d['data'],
                    'start_time' => $d['hora_inicio'],
                    'end_time' => $d['hora_fim'],
                ]);

                // Gera os slots de acordo com a duração
                $start = Carbon::parse($d['hora_inicio']);
                $end = Carbon::parse($d['hora_fim']);

                while ($start < $end) {
                    $slotEnd = $start->copy()->addMinutes($validated['duracao_slot']);
                    if ($slotEnd > $end) {
                        $slotEnd = $end->copy();
                    }

                    DoctorAvailabilitySlot::create([
                        'availability_date_id' => $date->id,
                        'start_time' => $start->format('H:i'),
                        'end_time' => $slotEnd->format('H:i'),
                        'is_booked' => false,
                    ]);

                    $start->addMinutes($validated['duracao_slot']);
                }
            }
        });

        return redirect()
            ->route('secretary.doctor-availability.show', ['id' => $validated['doctor_id']])
            ->with('success', 'Disponibilidade criada com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'datas' => 'required|array',
            'datas.*.data' => 'required|date',
            'datas.*.hora_inicio' => 'required|string',
            'datas.*.hora_fim' => 'required|string',
            'duracao_slot' => 'required|integer|min:5',
            'ativo' => 'boolean',
        ]);

        foreach ($validated['datas'] as &$d) {
            $d['hora_inicio'] = Carbon::parse($d['hora_inicio'])->format('H:i');
            $d['hora_fim'] = Carbon::parse($d['hora_fim'])->format('H:i');
        }

        DB::transaction(function () use ($validated, $id) {
            $availability = DoctorAvailability::findOrFail($id);

            // Atualiza dados principais
            $availability->update([
                'type' => 'specific_date',
                'slot_duration' => $validated['duracao_slot'],
                'is_active' => $validated['ativo'] ?? true,
            ]);

            // Limpa datas antigas e slots que não estão mais no request
            $oldDates = DoctorAvailabilityDate::where('availability_id', $availability->id)->pluck('id');
            DoctorAvailabilitySlot::whereIn('availability_date_id', $oldDates)->delete();
            DoctorAvailabilityDate::where('availability_id', $availability->id)->delete();

            // Adiciona novas datas e slots com updateOrCreate
            foreach ($validated['datas'] as $d) {
                $date = DoctorAvailabilityDate::updateOrCreate(
                    [
                        'availability_id' => $availability->id,
                        'date' => $d['data'],
                    ],
                    [
                        'start_time' => $d['hora_inicio'],
                        'end_time' => $d['hora_fim'],
                    ]
                );

                $start = Carbon::parse($d['hora_inicio']);
                $end = Carbon::parse($d['hora_fim']);

                while ($start < $end) {
                    $slotEnd = $start->copy()->addMinutes($validated['duracao_slot']);
                    if ($slotEnd > $end) $slotEnd = $end->copy();

                    DoctorAvailabilitySlot::updateOrCreate(
                        [
                            'availability_date_id' => $date->id,
                            'start_time' => $start->format('H:i'),
                            'end_time' => $slotEnd->format('H:i'),
                        ],
                        [
                            'is_booked' => false, // mantém como disponível
                        ]
                    );

                    $start->addMinutes($validated['duracao_slot']);
                }
            }
        });

        $availability = DoctorAvailability::findOrFail($id);

        return redirect()
            ->route('secretary.doctor-availability.show', ['id' => $availability->doctor_id])
            ->with('success', 'Disponibilidade atualizada com sucesso!');
    }

}
