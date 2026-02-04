<?php

class Mailer {
    
    /**
     * Enviar email de confirmación de registro
     */
    public function sendConfirmationEmail($email, $name) {
        $subject = "Confirmación de Registro - AJE10";
        
        $message = "
        <html>
            <head>
                <title>Confirmación de Registro</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                    .header { background-color: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; }
                    .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
                    .btn { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>♔ AJE10 ♔</h1>
                        <h2>¡Bienvenido!</h2>
                    </div>
                    <div class='content'>
                        <p>Hola <strong>$name</strong>,</p>
                        <p>Tu registro en AJE10 ha sido completado exitosamente.</p>
                        <p>Ya puedes iniciar sesión y comenzar a jugar ajedrez online contra jugadores reales y bots con diferentes niveles de dificultad.</p>
                        <p>¡Esperamos que disfrutes la experiencia!</p>
                        <p style='margin-top: 30px;'>
                            <strong>Detalles de tu cuenta:</strong><br>
                            Email: <strong>$email</strong><br>
                            Nombre: <strong>$name</strong>
                        </p>
                        <p style='margin-top: 20px;'>
                            Si tienes alguna pregunta, no dudes en contactarnos en <a href='mailto:soporte@aje10.com'>soporte@aje10.com</a>
                        </p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2026 AJE10. Todos los derechos reservados.</p>
                        <p>AJE10 - Juega · Aprende · Domina</p>
                    </div>
                </div>
            </body>
        </html>
        ";
        
        // Headers del email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
        $headers .= "From: noreply@aje10.com" . "\r\n";
        
        // Enviar email
        return mail($email, $subject, $message, $headers);
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    public function sendResetPasswordEmail($email, $name, $resetLink) {
        $subject = "Recuperar Contraseña - AJE10";
        
        $message = "
        <html>
            <head>
                <title>Recuperar Contraseña</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                    .header { background-color: #f4a460; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; }
                    .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
                    .btn { display: inline-block; padding: 12px 25px; background-color: #f4a460; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: bold; }
                    .warning { color: #e74c3c; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>♔ AJE10 ♔</h1>
                        <h2>Recuperar Contraseña</h2>
                    </div>
                    <div class='content'>
                        <p>Hola <strong>$name</strong>,</p>
                        <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
                        <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
                        <p style='margin-top: 20px; text-align: center;'>
                            <a href='$resetLink' class='btn'>Restablecer Contraseña</a>
                        </p>
                        <p style='margin-top: 20px;'>
                            <strong>O copia y pega este enlace en tu navegador:</strong><br>
                            <code style='background-color: #f5f5f5; padding: 10px; display: block; word-break: break-all;'>$resetLink</code>
                        </p>
                        <p style='margin-top: 20px;'>
                            <span class='warning'>⚠️ Este enlace expira en 1 hora.</span>
                        </p>
                        <p style='margin-top: 20px;'>
                            Si no solicitaste recuperar tu contraseña, puedes ignorar este email.
                        </p>
                        <p style='margin-top: 20px;'>
                            Si tienes alguna pregunta, contacta a <a href='mailto:soporte@aje10.com'>soporte@aje10.com</a>
                        </p>
                    </div>
                    <div class='footer'>
                        <p>&copy; 2026 AJE10. Todos los derechos reservados.</p>
                        <p>AJE10 - Juega · Aprende · Domina</p>
                    </div>
                </div>
            </body>
        </html>
        ";
        
        // Headers del email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
        $headers .= "From: noreply@aje10.com" . "\r\n";
        
        // Enviar email
        return mail($email, $subject, $message, $headers);
    }
    }
}
