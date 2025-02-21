defmodule RebuWebApi.Repo.Migrations.CreateSeparateAdminEntity do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:admin_users) do
      add :first_name, :string
      add :last_name, :string
      add :email, :citext
      add :hashed_password, :string, null: false
      add :role, :string
      add :revenue, :numeric, default: 0.0, null: false
      add :token_balance, :numeric, default: 0.0, null: false
      add :locked_tokens, :numeric, default: 0.0, null: false
      timestamps(type: :utc_datetime)
    end

    alter table(:offers) do
      add :admin_id, references(:admin_users, on_delete: :nothing)
    end
  end
end
