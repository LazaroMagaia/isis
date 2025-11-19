<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Fatura</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>

<h2>Fatura #{{ $invoiceNumber }}</h2>
<p><strong>Consulta:</strong> #{{ $appointment->id }}</p>
<p><strong>Paciente:</strong> {{ $invoice->patient->name}}</p>
<p><strong>Secretária:</strong> {{ $invoice->secretary->name ?? 'N/A' }}</p>
<p><strong>Emitida em:</strong> {{ $dateTime }}</p>
<table>
    <thead>
        <tr>
            <th>Medicamento</th>
            <th>Lote</th>
            <th>Qtd</th>
            <th>Preço Unit.</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($invoice->items as $item)
            @php
                $unitPrice = $item->unit_price ?? ($item->batch->cost_price ?? 0);
                $totalPrice = $unitPrice * $item->quantity;
                $batchNumber = $item->batch->batch_number ?? '-';
            @endphp
            <tr>
                <td>{{ $item->medicine->name ?? $item->prescription->medication }}</td>
                <td>{{ $batchNumber }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ number_format($unitPrice, 2) }} MT</td>
                <td>{{ number_format($totalPrice, 2) }} MT</td>
            </tr>
        @endforeach
    </tbody>
</table>

<h3 style="text-align:right; margin-top:20px;">
    Total: {{ number_format($invoice->items->sum(function($item) { 
        return ($item->unit_price ?? ($item->batch->cost_price ?? 0)) * $item->quantity; 
    }), 2) }} MT
</h3>

</body>
</html>
