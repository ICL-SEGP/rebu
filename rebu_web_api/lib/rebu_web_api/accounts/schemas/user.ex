defmodule RebuWebApi.Accounts.User do
  alias RebuWebApi.Accounts.AccountChangesetHelpers
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:first_name, :last_name, :email]}

  schema "users" do
    field :first_name, :string
    field :last_name, :string
    field :email, :string
    field :token_balance, :decimal, default: 0.0
    field :password, :string, redact: true, virtual: true
    field :hashed_password, :string, redact: true
    field :solana_pub_key, :string
    field :date_joined, :date

    field :role, Ecto.Enum, values: [:user], default: :user

    has_many :orders, RebuWebApi.Sales.Order
    belongs_to :affiliate, RebuWebApi.Accounts.Affiliate

    timestamps(type: :utc_datetime)
  end

  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [
      :first_name,
      :last_name,
      :email,
      :token_balance,
      :password,
      :role,
      :date_joined,
      :solana_pub_key
    ])
    |> validate_required([
      :first_name,
      :last_name,
    ])
    |> validate_inclusion(:role, [:user])
    |> AccountChangesetHelpers.validate_email()
    |> AccountChangesetHelpers.validate_password()
  end

  # def role_changeset(user, attrs) do
  #   user
  #   |> cast(attrs, [:role])
  #   # Fix incorrect field
  #   |> validate_inclusion(:role, [:user])
  #   |> case do
  #     %{changes: %{role: _}} = changeset -> changeset
  #     # Fix incorrect key
  #     %{} = changeset -> add_error(changeset, :role, "invalid option")
  #   end
  # end
end
