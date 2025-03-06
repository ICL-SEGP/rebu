defmodule RebuWebApi.Repo.Migrations.AddReferralCodeToAffiliate do
  use Ecto.Migration

  def change do
    alter table(:affiliates) do
      add :referral_code, :string
    end
  end
end
