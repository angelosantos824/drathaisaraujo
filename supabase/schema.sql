-- Schema inicial para Supabase / PostgreSQL da Clínica Dra. Thaís Araújo

create table if not exists usuarios (
  id bigserial primary key,
  email text unique not null,
  nome text not null,
  telefone text,
  nivel_acesso text not null default 'recepcao',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pacientes (
  id bigserial primary key,
  nome text not null,
  telefone text not null,
  data_nascimento date not null,
  cpf text,
  endereco text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agendamentos (
  id bigserial primary key,
  paciente_id bigint references pacientes(id) on delete set null,
  data_agendamento date not null,
  hora_agendamento time not null,
  servico text not null,
  status text not null default 'Agendado',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists atendimentos (
  id bigserial primary key,
  agendamento_id bigint references agendamentos(id) on delete cascade,
  paciente_id bigint references pacientes(id) on delete set null,
  data_atendimento date not null,
  observacoes text,
  realizado_por bigint references usuarios(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categorias_financeiras (
  id bigserial primary key,
  nome text not null,
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists fluxo_caixa (
  id bigserial primary key,
  paciente_id bigint references pacientes(id) on delete set null,
  agendamento_id bigint references agendamentos(id) on delete set null,
  categoria_id bigint references categorias_financeiras(id) on delete set null,
  tipo text not null check (tipo in ('entrada', 'saida')),
  descricao text,
  valor numeric not null,
  data date not null,
  forma_pagamento text not null default 'Dinheiro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to update updated_at automatically
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_pacientes
before update on pacientes
for each row
execute procedure set_updated_at();

create trigger set_updated_at_agendamentos
before update on agendamentos
for each row
execute procedure set_updated_at();

create trigger set_updated_at_atendimentos
before update on atendimentos
for each row
execute procedure set_updated_at();

create trigger set_updated_at_categorias_financeiras
before update on categorias_financeiras
for each row
execute procedure set_updated_at();

create trigger set_updated_at_fluxo_caixa
before update on fluxo_caixa
for each row
execute procedure set_updated_at();

create trigger set_updated_at_usuarios
before update on usuarios
for each row
execute procedure set_updated_at();
