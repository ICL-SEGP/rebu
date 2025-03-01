defmodule RebuWebApi.Repo.Migrations.CreateSeparateAffiliateEntity do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:affiliates) do
      add :first_name, :string
      add :last_name, :string
      add :email, :citext
      add :hashed_password, :string, null: false
      add :role, :string
      add :revenue, :numeric, default: 0.0, null: false
      add :token_balance, :numeric, default: 0.0, null: false
      add :solana_pub_key, :string
      timestamps(type: :utc_datetime)
    end

    alter table(:offers) do
      add :affiliate_id, references(:affiliates, on_delete: :nothing)
    end
  end
end
