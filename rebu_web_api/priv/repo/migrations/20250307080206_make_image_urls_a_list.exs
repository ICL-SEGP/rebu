defmodule RebuWebApi.Repo.Migrations.MakeImageUrlsAList do
  @moduledoc false
  use Ecto.Migration

  def change do
    alter table(:products) do
      remove :image_url
      add :image_urls, {:array, :string}
    end
  end
end
