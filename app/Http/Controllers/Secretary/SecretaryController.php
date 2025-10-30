<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecretaryController extends Controller
{
    protected $route = 'Backend/Secretary';
    public function index()
    {
        return Inertia::render($this->route . '/Index');
    }
}
