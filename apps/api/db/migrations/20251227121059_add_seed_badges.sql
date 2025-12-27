-- migrate:up
insert into badges(code, title, description, icon)
values
    ('early_bird', 'Early Bird', 'Premier défi complété', '🌅'),
    ('globe_trotter', 'Globe Trotter', '5 campus visités', '🌍'),
    ('creative', 'Créatif', '10 défis créatifs', '🎨'),
    ('social_star', 'Social Star', '50 partages', '⭐'),
    ('marathon', 'Marathonien', 'Tous les défis d''une journée', '🏃'),
    ('ambassador', 'Ambassadeur', '5 défis proposés validés', '🎖️')
    on conflict (code) do nothing;

-- migrate:down
delete from badges where code in ('early_bird','globe_trotter','creative','social_star','marathon','ambassador');