defmodule RebuWebApi.Repo.Migrations.CreateOffers do
  @moduledoc false
  use Ecto.Migration

  def change do
    create table(:offers) do
      add :affiliate_link, :string
      add :rebate_percentage, :decimal
      add :desc, :string
      add :offer_start, :naive_datetime
      add :offer_end, :naive_datetime

      timestamps(type: :utc_datetime)
    end
  end
end
