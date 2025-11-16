<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receita - Consulta #{{ $appointment->id }}</title>
    <style>
        body { font-family: Arial, sans-serif; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <h1>Receita Médica - Consulta #{{ $appointment->id }}</h1>

    <p><strong>Paciente:</strong> {{ $appointment->patient->name }}</p>
    <p><strong>Médico:</strong> {{ $appointment->doctor->name }}</p>
    <p><strong>Secretário(a):</strong> {{ auth()->user()->name }}</p>

    <table>
        <thead>
            <tr>
                <th>Medicamento</th>
                <th>Dosagem</th>
                <th>Frequência</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($prescriptions as $prescription)
                <tr>
                    <td>{{ $prescription->medication }}</td>
                    <td>{{ $prescription->dosage }}</td>
                    <td>{{ $prescription->frequency }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p style="margin-top:50px;">Assinatura do médico: ____________________</p>
</body>
</html>
