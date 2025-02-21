defmodule RebuWebApi.Accounts.Admin do
  use Ecto.Schema
  import Ecto.Changeset
  alias RebuWebApi.Accounts.AccountChangesetHelpers

  #  const stats = {
  #   totalUsers: 150,
  #   totalRevenue: 23400,
  #   activeOffers: 12,
  #   completedOrders: 50, // completed/refunded orders
  # };

  # Dummy data
  # const data = [
  #   { month: "January", revenue: 3000 },
  #   { month: "February", revenue: 5000 },
  #   { month: "March", revenue: 4000 },
  #   { month: "April", revenue: 6000 },
  #   { month: "May", revenue: 5500 },
  #   { month: "June", revenue: 7000 },
  # ];

  @derive {Jason.Encoder,
           only: [
             :id,
             :first_name,
             :last_name,
             :email,
             :revenue,
             :token_balance,
             :locked_tokens,
             :role,
             :inserted_at,
             :updated_at
           ]}

  schema "admin_users" do
    field :first_name, :string
    field :last_name, :string
    field :email, :string
    field :password, :string, redact: true, virtual: true
    field :hashed_password, :string, redact: true
    field :revenue, :decimal, default: 0.0
    field :token_balance, :decimal, default: 0.0
    field :locked_tokens, :decimal, default: 0.0

    field :role, Ecto.Enum, values: [:admin, :super_admin], default: :admin

    has_many :offers, RebuWebApi.Sales.Offer, where: [role: :admin]

    timestamps(type: :utc_datetime)
  end

  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [
      :first_name,
      :last_name,
      :email,
      :token_balance,
      :locked_tokens,
      :rescinded_tokens,
      :password,
      :role
    ])
    |> validate_required([:first_name, :last_name])
    |> validate_inclusion(:role, [:user])
    |> AccountChangesetHelpers.validate_email()
    |> AccountChangesetHelpers.validate_password()
  end
end
