defmodule RebuWebApi.Repo.Migrations.CreateUploads do
  use Ecto.Migration

  def change do
    create table(:uploads) do
      add :type, :string
      add :url, :string
      add :metadata, :map
      add :owner_id, :integer, null: false
      add :owner_type, :string, null: false
      add :key, :string, null: false

      timestamps(type: :utc_datetime)
    end

    create index(:uploads, [:owner_id, :owner_type])
  end
end
