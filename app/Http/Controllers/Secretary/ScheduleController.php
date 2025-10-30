<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
class ScheduleController extends Controller
{
    protected $route = 'Backend/Secretary/Schedule';
    public function index()
    {
        return Inertia::render($this->route . '/Index');
    }
}
