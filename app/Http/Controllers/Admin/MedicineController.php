<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\Medicines as Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Admin\Medicinecategories as Category;

class MedicineController extends Controller
{
    protected $route = 'Backend/Admin/Medicines';
   
    public function index()
    {
        // Inicia a query base
        $query = Medicine::with('category')->withCount('batches');

        // Aplica filtro de pesquisa por nome, se fornecido
        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Aplica filtro por categoria, se fornecido
        if ($categoryId = request('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Pagina os resultados mantendo query string
        $medicines = $query->paginate(10)->withQueryString();

        return Inertia::render($this->route.'/Index', [
            'medicines' => $medicines,
            'filters' => request()->only(['search', 'category_id']),
            'categories' => Category::orderBy('name')->get(), // para filtro dropdown
        ]);
    }


    public function create()
    {
          return Inertia::render($this->route.'/Create', [
            'categories' => Category::orderBy('name')->get(), // para filtro dropdown
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'category_id' => 'nullable|integer|exists:medicinecategories,id',
            'form' => 'required|string',
            'dosage' => 'required|string',
            'unit' => 'required|string',
        ]);

        Medicine::create($validated);

        return redirect()->route('admin.medicines.index')
            ->with('success', 'Medicine created successfully');
    }

    public function edit($id)
    {
        $medicine = Medicine::with('category')->findOrFail($id);
        $categories = Category::orderBy('name')->get();
        return Inertia::render($this->route.'/Edit', [
            'medicine' => $medicine,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'nullable|integer|exists:medicinecategories,id',
            'form'        => 'required|string|max:100',
            'dosage'      => 'required|string|max:50',
            'unit'        => 'required|string|max:50',
        ]);

        $medicine->update($validated);

        return redirect()->route('admin.medicines.index')
            ->with('success', 'Medicamento atualizado com sucesso');
    }


    public function destroy(Medicine $medicine)
    {
        $medicine->delete();

        return redirect()->route('admin.medicines.index')
            ->with('success', 'Medicine deleted');
    }
}
