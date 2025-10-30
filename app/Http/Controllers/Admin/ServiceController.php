<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Admin\ServiceCategory;
use App\Models\Admin\Service;
class ServiceController extends Controller
{
    protected $route = 'Backend/Admin/Service';
    public function index()
    {
        $service  = Service::all();
        $category = ServiceCategory::all();
        return Inertia::render($this->route.'/Index', [
            'service' => $service,
            'category' => $category,
        ]);
    }
    public function create()
    {
        $category = ServiceCategory::where('is_active', true)->get(['id', 'name']);
        return Inertia::render($this->route.'/Create', [
            'categories' => $category,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'price'             => 'required|numeric|min:0',
            'duration_minutes'  => 'required|integer|min:1',
            'category_id'       => 'required|exists:service_categories,id',
            'requires_approval' => 'boolean',
            'is_active'         => 'boolean',
        ]);

        Service::create($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'Serviço criado com sucesso!');
    }
    public function edit($id)
    {
        $service = Service::find($id);
        $category = ServiceCategory::where('is_active', true)->get(['id', 'name']);
        return Inertia::render($this->route.'/Edit', [
            'service' => $service,
            'categories' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'category_id' => 'required|exists:service_categories,id',
            'requires_approval' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $service =Service::findOrFail($id);
        $service->update($validated);

        return redirect()->back()
            ->with('success', 'Serviço atualizado com sucesso!');
    }
    public function destroy($id)
    {
        $service = Service::findorFail($id);
        $service->delete();
        return redirect()->back()
            ->with('success','Service deleted successfully');
    }
}
