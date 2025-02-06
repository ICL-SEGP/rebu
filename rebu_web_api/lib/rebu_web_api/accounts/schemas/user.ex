defmodule RebuWebApi.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:first_name, :last_name, :email, :balance]}

  schema "users" do
    field :first_name, :string
    field :last_name, :string
    field :email, :string
    field :balance, :decimal, default: 0.0
    field :password, :string, redact: true, virtual: true
    field :hashed_password, :string, redact: true

    field :role, Ecto.Enum, values: [:user, :admin, :super_admin], default: :user

    has_many :orders, RebuWebApi.Sales.Order
    has_many :offers, RebuWebApi.Sales.Offer

    timestamps(type: :utc_datetime)
  end

  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:first_name, :last_name, :email, :balance, :password, :role])
    |> validate_required([:first_name, :last_name, :balance])
    |> validate_inclusion(:role, [:user])
    |> validate_email()
    |> validate_password()
  end

  def validate_email(changeset) do
    changeset
    |> validate_required([:email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/)
    |> validate_length(:email, max: 160)
    |> unsafe_validate_unique(:email, RebuWebApi.Repo)
    |> unique_constraint(:email)
  end

  def validate_password(changeset) do
    changeset
    |> validate_required([:password])
    |> validate_length(:password, min: 8, max: 72)
    |> hash_password()
  end

  def hash_password(changeset) do
    if changeset.valid? do
      password = get_change(changeset, :password)

      changeset
      |> put_change(:hashed_password, Bcrypt.hash_pwd_salt(password))
      |> delete_change(:password)
    else
      changeset
    end
  end

  def email_changeset(user, attrs) do
    user
    |> cast(attrs, [:email])
    |> validate_email()
    |> case do
      %{changes: %{email: _}} = changeset -> changeset
      %{} = changeset -> add_error(changeset, :email, "no change to email")
    end
  end

  def name_changeset(user, attrs) do
    user
    |> cast(attrs, [:name])
    |> case do
      %{changes: %{name: _}} = changeset -> changeset
      %{} = changeset -> add_error(changeset, :name, "no change to email")
    end
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
