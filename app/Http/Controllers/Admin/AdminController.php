<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AdminController extends Controller
{
    protected $route = 'Backend/Admin';
    public function index()
    {
        return Inertia::render($this->route . '/Index');
    }
}
