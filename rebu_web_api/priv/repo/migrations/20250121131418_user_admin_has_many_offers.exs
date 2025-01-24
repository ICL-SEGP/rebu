defmodule RebuWebApi.Repo.Migrations.UserAdminHasManyOffers do
  @moduledoc false
  use Ecto.Migration

  def change do
    alter table(:offers) do
      add :user_id, references(:users)
    end
  end
end
