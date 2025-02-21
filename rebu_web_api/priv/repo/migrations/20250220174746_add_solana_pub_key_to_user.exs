defmodule RebuWebApi.Repo.Migrations.AddSolanaPubKeyToUser do
  use Ecto.Migration

  def change do

    alter table(:users) do
      add :solana_pub_key, :string
    end

  end
end
