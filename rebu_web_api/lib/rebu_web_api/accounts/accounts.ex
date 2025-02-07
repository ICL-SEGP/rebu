defmodule RebuWebApi.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias RebuWebApi.Repo

  alias RebuWebApi.Accounts.User
  alias RebuWebApi.Auth.Guardian
  alias RebuWebApi.Sales
  alias RebuWebApi.Sales.Offer

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  def get_user_by_email!(email), do: Repo.get_by!(User, email: email)

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def register_user(attrs \\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_email(%User{} = user, attrs) do
    user
    |> User.email_changeset(attrs)
    |> Repo.update()
  end

  def update_name(%User{} = user, attrs) do
    user
    |> User.name_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  def authenticate_sign_in(email, password) do
    query_results = from u in User, where: u.email == ^email

    case Repo.one(query_results) do
      nil ->
        Bcrypt.no_user_verify()
        {:error, :invalid_credentials}

      user ->
        if Bcrypt.verify_pass(password, user.hashed_password) do
          {:ok, user, create_user_token(user)}
        else
          {:error, :invalid_credentials}
        end
    end
  end

  def create_user_token(user) do
    {:ok, token, _claims} = Guardian.encode_and_sign(user)
    token
  end

  def update_user_balance(user, amount, :debit) do
    if user.balance - amount < 0 do
      {:error, :insufficient_funds}
    else
      subtract_from_balance(user.id, amount)
    end
  end

  def update_user_balance(user, amount, :credit) do
    add_to_balance(user.id, amount)
  end

  defp add_to_balance(user_id, amount) when is_number(amount) and amount > 0 do
    from(u in User, where: u.id == ^user_id)
    |> Repo.update_all(inc: [balance: amount])
  end

  defp subtract_from_balance(user_id, amount) when is_number(amount) and amount > 0 do
    from(u in User, where: u.id == ^user_id)
    |> Repo.update_all(inc: [balance: -amount])
  end

  def get_user_balance!(user_id) do
    get_user!(user_id).balance
  end

  def calculate_balances!(user) do
    orders = Sales.get_orders_by_user(user)

    Enum.reduce(orders, %{tokens: 0, locked: 0, rescinded: 0}, fn order, acc ->
      case order.status do
        :in_progress ->
          %{acc | locked: acc.locked + Decimal.to_float(order.total_rebate_amount)}

        :completed ->
          %{acc | tokens: acc.tokens + Decimal.to_float(order.total_rebate_amount)}

        :refunded ->
          %{acc | rescinded: acc.rescinded + Decimal.to_float(order.total_rebate_amount)}
      end
    end)
  end

  def set_admin(%User{id: _id} = user, role) do
    # TODO: add authorization checking of super admin later
    case role do
      :super_admin -> {:error, :unauthorized}
      :admin -> User.role_changeset(user, %{role: role})
      :user -> User.role_changeset(user, %{role: role})
      _ -> {:error, :invalid_role_passed}
    end
  end

  def is_admin(%User{id: id}) do
    result = get_user!(id)

    result.role == :admin || result.role == :super_admin
  end

  def get_users_by_role(role) do
    query = from u in User, where: u.role == ^role
    Repo.all(query)
  end

  def create_rebate_offer(%User{id: id} = user, offer_attrs) do
    if !is_admin(user) do
      {:error, :unauthorized}
    else
      Sales.create_offer(Map.put(offer_attrs, :user_id, id))
    end
  end

  def process_order_for_offer(%User{id: user_id}, %Offer{id: offer_id}, order_attrs) do
    Sales.create_order(Map.merge(order_attrs, %{user_id: user_id, offer_id: offer_id}))
  end
end
