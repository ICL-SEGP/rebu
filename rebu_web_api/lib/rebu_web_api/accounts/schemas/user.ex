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
    field :locked_tokens, :decimal, default: 0.0
    field :rescinded_tokens, :decimal, default: 0.0
    field :password, :string, redact: true, virtual: true
    field :hashed_password, :string, redact: true

    field :role, Ecto.Enum, values: [:user, :admin, :super_admin], default: :user

    has_many :orders, RebuWebApi.Sales.Order
    has_many :offers, RebuWebApi.Sales.Offer, where: [role: :admin]

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
    |> cast(attrs, [:first_name, :last_name, :email, :token_balance, :locked_tokens, :rescinded_tokens, :password, :role])
    |> validate_required([:first_name, :last_name, :token_balance, :locked_tokens, :rescinded_tokens])
    |> validate_inclusion(:role, [:user])
    |> AccountChangesetHelpers.validate_email()
    |> AccountChangesetHelpers.validate_password()
  end

  def role_changeset(user, attrs) do
    user
    |> cast(attrs, [:role])
    # Fix incorrect field
    |> validate_inclusion(:role, [:user, :admin, :super_admin])
    |> case do
      %{changes: %{role: _}} = changeset -> changeset
      # Fix incorrect key
      %{} = changeset -> add_error(changeset, :role, "invalid option")
    end
  end
end
