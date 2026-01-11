-- migrate:up
INSERT INTO campuses (name, city) VALUES
    ('Mediaschool - Marseille', 'Marseille'),
    ('Mediaschool - Paris', 'Paris'),
    ('Mediaschool - Strasbourg', 'Strasbourg'),
    ('Mediaschool - Toulouse', 'Toulouse'),
    ('Mediaschool - Nice', 'Nice'),
    ('Mediaschool - Rennes', 'Rennes'),
    ('Mediaschool - Reims', 'Reims'),
    ('Mediaschool - Montpellier', 'Montpellier'),
    ('Mediaschool - Angoulême', 'Angoulême'),
    ('Mediaschool - Barcelone', 'Barcelone'),
    ('Mediaschool - Bruxelle', 'Bruxelle'),
    ('Mediaschool - Rouen', 'Rouen');

-- migrate:down
DELETE FROM campuses WHERE name IN (
    'Mediaschool - Marseille',
    'Mediaschool - Paris',
    'Mediaschool - Strasbourg',
    'Mediaschool - Toulouse',
    'Mediaschool - Nice',
    'Mediaschool - Rennes',
    'Mediaschool - Reims',
    'Mediaschool - Montpellier',
    'Mediaschool - Angoulême',
    'Mediaschool - Barcelone',
    'Mediaschool - Bruxelle',
    'Mediaschool - Rouen'
);
