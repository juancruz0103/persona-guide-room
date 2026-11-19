-- Las builds aceptan también Persona 5 Strikers.
alter table public.builds drop constraint builds_game_check;
alter table public.builds add constraint builds_game_check check (game = any (array['p5r','p3r','p4g','p5s']));
