-- ============================================================
-- LIFE LINK - BLOOD DONATION SYSTEM
-- Complete Database Schema
-- ============================================================

DROP DATABASE IF EXISTS blood_donation_system;

CREATE DATABASE blood_donation_system;

USE blood_donation_system;


-- ============================================================
-- 1. USERS
-- ============================================================
-- One USER can:
--   - request blood
--   - donate blood
--
-- ADMIN and BLOOD_BANK remain separate roles.
-- ============================================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    role ENUM(
        'USER',
        'BLOOD_BANK',
        'ADMIN'
    ) NOT NULL DEFAULT 'USER',

    status ENUM(
        'ACTIVE',
        'INACTIVE',
        'BLOCKED'
    ) NOT NULL DEFAULT 'ACTIVE',

    -- ========================================================
    -- User blood/donation profile
    -- ========================================================

    blood_group VARCHAR(5),

    date_of_birth DATE,

    gender VARCHAR(20),

    last_donation_date DATE,

    availability_status ENUM(
        'AVAILABLE',
        'UNAVAILABLE'
    ) NOT NULL DEFAULT 'AVAILABLE',

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_blood_group
        CHECK (
            blood_group IS NULL
            OR blood_group IN (
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            )
        )
);


-- ============================================================
-- 2. BLOOD BANKS
-- ============================================================
-- A Blood Bank is still a separate role.
--
-- user_id connects the blood-bank login account to its
-- blood-bank profile.
-- ============================================================

CREATE TABLE blood_banks (
    bank_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT UNIQUE,

    bank_name VARCHAR(150) NOT NULL,

    phone VARCHAR(20),

    email VARCHAR(150),

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_blood_bank_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ============================================================
-- 3. BLOOD REQUESTS
-- ============================================================
-- A request belongs directly to a USER.
--
-- There is NO recipient_id.
--
-- The same USER can make requests and also donate blood.
-- ============================================================

CREATE TABLE blood_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    blood_group VARCHAR(5) NOT NULL,

    units_required INT NOT NULL DEFAULT 1,

    units_fulfilled INT NOT NULL DEFAULT 0,

    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    required_by_date DATE NOT NULL,

    urgency ENUM(
        'NORMAL',
        'URGENT',
        'EMERGENCY'
    ) NOT NULL DEFAULT 'NORMAL',

    hospital_name VARCHAR(200) NOT NULL,

    address TEXT,

    city VARCHAR(100),

    status ENUM(
        'PENDING',
        'ACCEPTED',
        'PARTIALLY_FULFILLED',
        'FULFILLED',
        'REJECTED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_request_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_request_blood_group
        CHECK (
            blood_group IN (
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            )
        ),

    CONSTRAINT chk_request_units
        CHECK (units_required > 0),

    CONSTRAINT chk_request_fulfilled
        CHECK (
            units_fulfilled >= 0
            AND units_fulfilled <= units_required
        )
);


-- ============================================================
-- 4. DONATIONS
-- ============================================================
-- A donation belongs directly to a USER.
--
-- There is NO donor_id.
--
-- Any USER may donate when eligible/available.
-- ============================================================

CREATE TABLE donations (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    bank_id INT NOT NULL,

    blood_group VARCHAR(5) NOT NULL,

    donation_date DATE NOT NULL,

    units INT NOT NULL,

    status ENUM(
        'SCHEDULED',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'SCHEDULED',

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_donation_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_donation_bank
        FOREIGN KEY (bank_id)
        REFERENCES blood_banks(bank_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_donation_blood_group
        CHECK (
            blood_group IN (
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            )
        ),

    CONSTRAINT chk_donation_units
        CHECK (units > 0)
);


-- ============================================================
-- 5. INVENTORY
-- ============================================================
-- Blood inventory belongs to Blood Banks.
-- ============================================================

CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,

    bank_id INT NOT NULL,

    blood_group VARCHAR(5) NOT NULL,

    units_available INT NOT NULL DEFAULT 0,

    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_bank
        FOREIGN KEY (bank_id)
        REFERENCES blood_banks(bank_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_inventory_blood_group
        CHECK (
            blood_group IN (
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            )
        ),

    CONSTRAINT chk_inventory_units
        CHECK (units_available >= 0),

    CONSTRAINT unique_bank_blood_group
        UNIQUE (bank_id, blood_group)
);


-- ============================================================
-- 6. REQUEST RESPONSES
-- ============================================================
-- A USER can respond to another USER's blood request.
--
-- IMPORTANT:
-- request_id -> blood request
-- user_id    -> responding user
--
-- The database trigger below prevents a user from responding
-- to their own blood request.
-- ============================================================

CREATE TABLE request_responses (
    response_id INT PRIMARY KEY AUTO_INCREMENT,

    request_id INT NOT NULL,

    user_id INT NOT NULL,

    response_status ENUM(
        'INTERESTED',
        'ACCEPTED',
        'REJECTED',
        'COMPLETED'
    ) NOT NULL DEFAULT 'INTERESTED',

    response_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    notes TEXT,

    CONSTRAINT fk_response_request
        FOREIGN KEY (request_id)
        REFERENCES blood_requests(request_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_response_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT unique_request_user
        UNIQUE (request_id, user_id)
);


-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(50),

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- ============================================================
-- 8. SYSTEM SETTINGS
-- ============================================================

CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,

    setting_key VARCHAR(100) NOT NULL UNIQUE,

    setting_value VARCHAR(255) NOT NULL,

    description TEXT,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- 9. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NULL,

    action VARCHAR(100) NOT NULL,

    description TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ============================================================
-- 10. DEFAULT SYSTEM SETTINGS
-- ============================================================

INSERT INTO system_settings
(
    setting_key,
    setting_value,
    description
)
VALUES
(
    'maximum_blood_request_units',
    '10',
    'Maximum number of blood units a user can request'
),
(
    'emergency_request_enabled',
    'true',
    'Allow users to create emergency blood requests'
);


-- ============================================================
-- 11. INDEXES
-- ============================================================

CREATE INDEX idx_users_role
    ON users(role);

CREATE INDEX idx_users_status
    ON users(status);

CREATE INDEX idx_users_blood_group
    ON users(blood_group);

CREATE INDEX idx_users_availability
    ON users(availability_status);

CREATE INDEX idx_users_city
    ON users(city);

CREATE INDEX idx_requests_user
    ON blood_requests(user_id);

CREATE INDEX idx_requests_blood_group
    ON blood_requests(blood_group);

CREATE INDEX idx_requests_status
    ON blood_requests(status);

CREATE INDEX idx_requests_city
    ON blood_requests(city);

CREATE INDEX idx_donations_user
    ON donations(user_id);

CREATE INDEX idx_donations_bank
    ON donations(bank_id);

CREATE INDEX idx_donations_date
    ON donations(donation_date);

CREATE INDEX idx_responses_request
    ON request_responses(request_id);

CREATE INDEX idx_responses_user
    ON request_responses(user_id);

CREATE INDEX idx_notifications_user
    ON notifications(user_id);

CREATE INDEX idx_audit_user
    ON audit_logs(user_id);


-- ============================================================
-- 12. PREVENT SELF RESPONSE
-- ============================================================
-- A user cannot respond to their own blood request.
--
-- Example:
--
-- User 10 creates request #50
-- request.user_id = 10
--
-- User 10 attempts to create response:
-- response.user_id = 10
--
-- Database rejects it.
-- ============================================================

DELIMITER $$

CREATE TRIGGER prevent_self_request_response
BEFORE INSERT ON request_responses
FOR EACH ROW
BEGIN

    DECLARE request_owner INT;

    SELECT user_id
    INTO request_owner
    FROM blood_requests
    WHERE request_id = NEW.request_id;

    IF request_owner = NEW.user_id THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'A user cannot respond to their own blood request';

    END IF;

END$$

DELIMITER ;


-- ============================================================
-- 13. PREVENT SELF RESPONSE UPDATE
-- ============================================================
-- Also protect against changing an existing response so that
-- it becomes a self-response.
-- ============================================================

DELIMITER $$

CREATE TRIGGER prevent_self_request_response_update
BEFORE UPDATE ON request_responses
FOR EACH ROW
BEGIN

    DECLARE request_owner INT;

    SELECT user_id
    INTO request_owner
    FROM blood_requests
    WHERE request_id = NEW.request_id;

    IF request_owner = NEW.user_id THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
            'A user cannot respond to their own blood request';

    END IF;

END$$

DELIMITER ;


-- ============================================================
-- 14. FINAL TABLE CHECK
-- ============================================================

SELECT
    TABLE_NAME
FROM
    information_schema.TABLES
WHERE
    TABLE_SCHEMA = 'blood_donation_system'
ORDER BY
    TABLE_NAME;