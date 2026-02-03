<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\ContactMessage;
use App\Mail\ContactMessageReceived;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string'
        ]);

        $message = ContactMessage::create($data);

        // Send mail to the configured support address or to admin
        try {
            $to = config('mail.from.address', 'support@chesshub.com');
            Mail::to($to)->send(new ContactMessageReceived($message));
        } catch (\Exception $e) {
            // Log but do not fail the user
            logger()->error('Mail send failed: '.$e->getMessage());
        }

        $successMessage = 'Mensaje enviado correctamente. Gracias.';

        if ($request->wantsJson() || $request->isMethod('get')) {
            return response()->json(['success' => true, 'message' => $successMessage]);
        }

        return back()->with('success', $successMessage);
    }
}
