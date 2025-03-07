defmodule RebuWebApi.Repo.Migrations.CreateProducts do
  use Ecto.Migration

  def change do
    create table(:products) do
      add :name, :string
      add :desc, :text
      add :price, :decimal
      add :image_urls, {:array, :string}
      add :file_url, :string
      add :file_type, :string
      add :status, :string
      add :qty, :integer
      add :seller_id, :integer
      add :seller_type, :string

      timestamps(type: :utc_datetime)
    end
  end
end
