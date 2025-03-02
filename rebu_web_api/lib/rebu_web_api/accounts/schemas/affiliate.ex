defmodule RebuWebApi.Accounts.Affiliate do
  use Ecto.Schema
  import Ecto.Changeset
  alias RebuWebApi.Accounts.AccountChangesetHelpers

  @derive {Jason.Encoder,
           only: [
             :id,
             :first_name,
             :last_name,
             :email,
             :revenue,
             :token_balance,
             :role,
             :inserted_at,
             :updated_at
           ]}

  schema "affiliates" do
    field :first_name, :string
    field :last_name, :string
    field :email, :string
    field :password, :string, redact: true, virtual: true
    field :hashed_password, :string, redact: true
    field :revenue, :decimal, default: 0.0
    field :token_balance, :decimal, default: 0.0
    field :solana_pub_key, :string
    field :date_joined, :date

    field :role, Ecto.Enum, values: [:affiliate, :admin], default: :affiliate

    has_many :offers, RebuWebApi.Sales.Offer
    has_many :users, RebuWebApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @spec registration_changeset(
          {map(),
           %{
             optional(atom()) =>
               atom()
               | {:array | :assoc | :embed | :in | :map | :parameterized | :supertype | :try,
                  any()}
           }}
          | %{
              :__struct__ => atom() | %{:__changeset__ => any(), optional(any()) => any()},
              optional(atom()) => any()
            },
          :invalid | %{optional(:__struct__) => none(), optional(atom() | binary()) => any()}
        ) :: any()
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [
      :first_name,
      :last_name,
      :email,
      :token_balance,
      :password,
      :role,
      :solana_pub_key
    ])
    |> validate_required([:first_name, :last_name, :role])
    |> validate_inclusion(:role, [:user])
    |> AccountChangesetHelpers.validate_email()
    |> AccountChangesetHelpers.validate_password()
  end
end
