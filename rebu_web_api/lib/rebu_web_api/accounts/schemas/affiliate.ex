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
             :role,
             :inserted_at,
             :updated_at,
             :solana_pub_key
           ],
           except: [:token_balance, :revenue]}

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
    field :referral_code, :string

    field :role, Ecto.Enum, values: [:affiliate, :admin], default: :affiliate

    has_many :offers, RebuWebApi.Sales.Offer
    has_many :users, RebuWebApi.Accounts.User

    has_many :uploads, RebuWebApi.Uploads.Upload,
      foreign_key: :owner_id,
      where: [owner_type: :affiliate]

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
      :solana_pub_key
    ])
    |> validate_required([:first_name, :last_name, :role])
    |> validate_inclusion(:role, [:affiliate, :admin])
    |> generate_referral_code()
    |> AccountChangesetHelpers.validate_email()
    |> AccountChangesetHelpers.validate_password()
  end

  defp generate_referral_code(changeset) do
    role = get_field(changeset, :role)

    # Only generate referral_code if role is :affiliate and it's not already set
    if role == "affiliate" do
      if get_field(changeset, :referral_code) do
        changeset
      else
        put_change(
          changeset,
          :referral_code,
          :crypto.strong_rand_bytes(6) |> Base.url_encode64() |> binary_part(0, 8)
        )
      end
    else
      # If not affiliate, remove referral_code if it exists
      changeset |> put_change(:referral_code, nil)
    end
  end
end
