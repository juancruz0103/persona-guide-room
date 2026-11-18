-- Campos que el usuario no puede elegir: los pone la base.
-- created_at: si se pudiera mandar una fecha vieja, el límite de publicaciones (rate_limit) no contaría esas filas.
-- build_id / user_id de un comentario: no se mueve a otra build. resolved de un reporte: solo lo cambia un admin.
-- avatar_url del perfil: hoy no se usa; solo un admin lo cambia, así nadie pone una imagen de afuera.
create or replace function private.protect_fields()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if private.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if tg_table_name in ('builds', 'build_comments', 'reports') then
      new.created_at := now();
    end if;
    if tg_table_name = 'reports' then
      new.resolved := false;
    end if;
    return new;
  end if;
  -- UPDATE
  if tg_table_name in ('builds', 'build_comments', 'reports', 'profiles') then
    new.created_at := old.created_at;
  end if;
  if tg_table_name = 'build_comments' then
    new.build_id := old.build_id;
    new.user_id := old.user_id;
  elsif tg_table_name = 'builds' then
    new.user_id := old.user_id;
  elsif tg_table_name = 'profiles' then
    new.avatar_url := old.avatar_url;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_fields() from public, anon, authenticated;

drop trigger if exists protect_fields on public.builds;
drop trigger if exists protect_fields on public.build_comments;
drop trigger if exists protect_fields on public.reports;
drop trigger if exists protect_fields on public.profiles;
create trigger protect_fields before insert or update on public.builds for each row execute function private.protect_fields();
create trigger protect_fields before insert or update on public.build_comments for each row execute function private.protect_fields();
create trigger protect_fields before insert or update on public.reports for each row execute function private.protect_fields();
create trigger protect_fields before update on public.profiles for each row execute function private.protect_fields();

-- Admin automático solo si la cuenta viene de Google (correo verificado por Google), no de un registro con contraseña.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, is_admin)
  values (
    new.id,
    lower(new.email) = 'personaguyconsultas@gmail.com'
      and new.raw_app_meta_data->>'provider' = 'google'
  );
  return new;
end;
$$;
