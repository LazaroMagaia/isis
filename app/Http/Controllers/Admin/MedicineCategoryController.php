<?php

namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Admin\Medicinecategories as Category;
use Illuminate\Support\Str;
class MedicineCategoryController extends Controller
{  
    protected $route = 'Backend/Admin/Medicines/Categories';
    public function index()
    {
        $categories = Category::orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render($this->route.'/Index', [
            'categories' => $categories,
            'filters' => request()->only(['search']),
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:medicinecategories,name',
            'description' => 'nullable|string',
        ]);
        $validated['slug'] = Str::slug($validated['name'], '-');
        Category::create($validated);

        return redirect()->route('admin.medicinecategories.index')
            ->with('success', 'Medicine category created successfully');
    }
    public function update(Request $request,$id)
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|unique:medicinecategories,name,'.$category->id,
            'description' => 'nullable|string',
        ]);
        $validated['slug'] = Str::slug($validated['name'], '-');
        $category->update($validated);

        return redirect()->route('admin.medicinecategories.index')
            ->with('success', 'Medicine category updated successfully');
    }
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return redirect()->route('admin.medicinecategories.index')
            ->with('success', 'Medicine category deleted successfully');
    }
}
