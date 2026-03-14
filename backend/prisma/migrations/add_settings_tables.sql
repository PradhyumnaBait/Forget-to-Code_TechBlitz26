-- Settings Tables for MedDesk System

-- 1. Clinic Settings
CREATE TABLE IF NOT EXISTS clinic_settings (
    id SERIAL PRIMARY KEY,
    clinic_name VARCHAR(255) NOT NULL DEFAULT 'MedDesk Clinic',
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    location_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctor Schedule Settings
CREATE TABLE IF NOT EXISTS doctor_schedule (
    id SERIAL PRIMARY KEY,
    working_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '18:00:00',
    break_start_time TIME DEFAULT '13:00:00',
    break_end_time TIME DEFAULT '14:00:00',
    appointment_duration INTEGER DEFAULT 30, -- minutes
    buffer_time INTEGER DEFAULT 5, -- minutes between appointments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointment Rules
CREATE TABLE IF NOT EXISTS appointment_rules (
    id SERIAL PRIMARY KEY,
    max_appointments_per_day INTEGER DEFAULT 40,
    allow_walk_ins BOOLEAN DEFAULT true,
    cancellation_time_limit INTEGER DEFAULT 2, -- hours before appointment
    reschedule_limit INTEGER DEFAULT 3, -- max reschedules allowed
    advance_booking_days INTEGER DEFAULT 30, -- how many days in advance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Notification Settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    whatsapp_enabled BOOLEAN DEFAULT false,
    sms_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    reminder_time INTEGER DEFAULT 24, -- hours before appointment
    confirmation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Billing Settings
CREATE TABLE IF NOT EXISTS billing_settings (
    id SERIAL PRIMARY KEY,
    default_consultation_fee DECIMAL(10,2) DEFAULT 500.00,
    tax_percentage DECIMAL(5,2) DEFAULT 18.00,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_methods TEXT[] DEFAULT ARRAY['cash','upi','card'],
    auto_generate_invoice BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO clinic_settings (clinic_name, address, phone, email, consultation_fee) 
VALUES ('MedDesk Clinic', 'Andheri West, Mumbai', '+91 9876543210', 'info@meddesk.in', 500.00)
ON CONFLICT DO NOTHING;

INSERT INTO doctor_schedule DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO appointment_rules DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO notification_settings DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO billing_settings DEFAULT VALUES ON CONFLICT DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('theme', 'light', 'string', 'UI Theme preference'),
('language', 'en', 'string', 'Default language'),
('session_timeout', '30', 'number', 'Session timeout in minutes'),
('enable_2fa', 'false', 'boolean', 'Two-factor authentication'),
('ai_assistant_enabled', 'true', 'boolean', 'Enable AI assistant'),
('analytics_default_view', 'last_7_days', 'string', 'Default analytics view')
ON CONFLICT (setting_key) DO NOTHING;