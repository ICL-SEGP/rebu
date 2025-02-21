defmodule RebuWebApi.Sales do
  @moduledoc """
  The Sales context.
  """

  import Ecto.Query, warn: false
  alias RebuWebApi.Repo

  alias RebuWebApi.Sales.Offer
  alias RebuWebApi.Sales.Order
  alias RebuWebApi.Accounts
  alias RebuWebApi.Accounts.User

  @doc """
  Returns the list of offers.

  ## Examples

      iex> list_offers()
      [%Offer{}, ...]

  """
  def list_offers do
    Repo.all(Offer)
  end

  def list_offers_grouped_by_status do
    offers = Repo.all(RebuWebApi.Sales.Offer)

    Enum.group_by(offers, & &1.status)
  end

  def get_offer_counts_by_status do
    offers = Repo.all(RebuWebApi.Sales.Offer)

    offers
    |> Enum.group_by(& &1.status)
    |> Enum.map(fn {status, list} -> {status, length(list)} end)
    # Convert to a map for better readability
    |> Enum.into(%{})
  end

  def list_offers_by_user(%User{} = user) do
    from(o in "offers", where: o.user_id == ^user.id)
    |> Repo.all()
  end

  @spec get_offer!(any()) :: any()
  @doc """
  Gets a single offer.

  Raises `Ecto.NoResultsError` if the Offer does not exist.

  ## Examples

      iex> get_offer!(123)
      %Offer{}

      iex> get_offer!(456)
      ** (Ecto.NoResultsError)

  """
  def get_offer!(id), do: Repo.get!(Offer, id)

  @doc """
  Creates a offer.

  ## Examples

      iex> create_offer(%{field: value})
      {:ok, %Offer{}}

      iex> create_offer(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_offer(admin, attrs \\ %{}) do
    %Offer{}
    |> Offer.changeset(attrs)
    |> Ecto.Changeset.put_assoc(:admin, admin)
    |> Repo.insert()
  end

  @doc """
  Updates a offer.

  ## Examples

      iex> update_offer(offer, %{field: new_value})
      {:ok, %Offer{}}

      iex> update_offer(offer, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_offer(%Offer{} = offer, attrs) do
    offer
    |> Offer.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a offer.

  ## Examples

      iex> delete_offer(offer)
      {:ok, %Offer{}}

      iex> delete_offer(offer)
      {:error, %Ecto.Changeset{}}

  """
  def delete_offer(%Offer{} = offer) do
    Repo.delete(offer)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking offer changes.

  ## Examples

      iex> change_offer(offer)
      %Ecto.Changeset{data: %Offer{}}

  """
  def change_offer(%Offer{} = offer, attrs \\ %{}) do
    Offer.changeset(offer, attrs)
  end

  @doc """
  Returns the list of orders.

  ## Examples

      iex> list_orders()
      [%Order{}, ...]

  """
  def list_orders do
    Repo.all(Order)
  end

  def list_orders_with_offers do
    Repo.all(Order)
    |> Repo.preload(:offers)
    |> Repo.preload(:user)
  end

  def list_orders_grouped_by_status do
    orders = Repo.all(RebuWebApi.Sales.Order)

    Enum.group_by(orders, & &1.status)
  end

  def get_order_counts_by_status do
    orders = Repo.all(RebuWebApi.Sales.Order)

    orders
    |> Enum.group_by(& &1.status)
    |> Enum.map(fn {status, list} -> {status, length(list)} end)
    # Convert to a map for easy access
    |> Enum.into(%{})
  end

  def get_orders_by_user(%User{} = user) do
    from(o in Order, where: o.user_id == ^user.id)
    |> Repo.all()
    |> Repo.preload(:offers)
  end

  @doc """
  Gets a single order.

  Raises `Ecto.NoResultsError` if the Order does not exist.

  ## Examples

      iex> get_order!(123)
      %Order{}

      iex> get_order!(456)
      ** (Ecto.NoResultsError)

  """
  def get_order!(id) do
    Repo.get!(Order, id)
    |> Repo.preload(:offers)
  end

  @doc """
  Creates a order.

  ## Examples

      iex> create_order(%{field: value})
      {:ok, %Order{}}

      iex> create_order(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_order(attrs \\ %{}) do
    %Order{}
    |> Order.changeset(attrs)
    |> Ecto.Changeset.put_assoc(:offers, attrs.offers)
    |> Ecto.Changeset.put_assoc(:user, attrs.user)
    |> Repo.insert()
  end

  def new_order(attrs \\ %{}) do
    # Convert string keys to atoms

    # attrs = atomize_keys(attrs)

    # Fetch offers by IDs
    # Get offer IDs or empty list
    offer_ids = Map.get(attrs, :offers, [])
    # Fetch Offer structs
    offers = Repo.all(from(o in Offer, where: o.id in ^offer_ids))

    %Order{}
    |> Order.changeset(attrs)
    # Pass Offer structs, not just IDs
    |> Ecto.Changeset.put_assoc(:offers, offers)
    # Ensure user exists
    |> Ecto.Changeset.put_assoc(:user, Repo.get_by!(Accounts.User, email: Map.get(attrs, :user)))
    |> Repo.insert()
  end

  # Utility function to convert string keys to atoms
  defp atomize_keys(params) when is_map(params) do
    Enum.into(params, %{}, fn {k, v} -> {String.to_atom(k), v} end)
  end

  @doc """
  Updates a order.

  ## Examples

      iex> update_order(order, %{field: new_value})
      {:ok, %Order{}}

      iex> update_order(order, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_order(%Order{} = order, attrs) do
    offer_ids = Map.get(attrs, :offers, [])
    # Fetch Offer structs
    offers = Repo.all(from(o in Offer, where: o.id in ^offer_ids))
    dbg(attrs)
    dbg(offers)

    order
    |> Order.changeset(attrs)
    |> Ecto.Changeset.put_assoc(:offers, offers)
    |> Repo.update()
  end

  @doc """
  Deletes a order.

  ## Examples

      iex> delete_order(order)
      {:ok, %Order{}}

      iex> delete_order(order)
      {:error, %Ecto.Changeset{}}

  """
  def delete_order(%Order{} = order) do
    Repo.delete(order)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking order changes.

  ## Examples

      iex> change_order(order)
      %Ecto.Changeset{data: %Order{}}

  """
  def change_order(%Order{} = order, attrs \\ %{}) do
    Order.changeset(order, attrs)
  end

  def create_rebate_offer(%Accounts.Admin{id: id} = user, offer_attrs) do
    create_offer(Map.put(offer_attrs, :user_id, id))
  end

  def process_order_for_offer(%User{id: user_id}, %Offer{id: offer_id}, order_attrs) do
    create_order(Map.merge(order_attrs, %{user_id: user_id, offer_id: offer_id}))
  end

  def process_order_completion(%Order{} = order) do
    with {:ok, order} <-
           order
           |> Order.status_changeset(%{status: :completed})
           |> Repo.update() do
      user = Accounts.get_user!(order.user_id)
      Accounts.update_user_balance(user, order.total_rebate_amount, :credit)
    end
  end

  def process_order_refund(%Order{} = order) do
    order
    |> Order.status_changeset(%{status: :refunded})
    |> Repo.update()
  end

  def get_monthly_order_stats do
    query =
      from(o in Order,
        select: {
          # Format `date` field to `YYYY-MM`
          fragment("TO_CHAR(?, 'YYYY-MM')", o.date),
          fragment("TO_CHAR(?, 'Month')", o.date),
          # Total orders in the month
          count(o.id),
          # Total rebate for completed orders
          sum(
            fragment(
              "CASE WHEN ? = 'completed' THEN ? ELSE 0 END",
              o.status,
              o.total_rebate_amount
            )
          ),
          # Total rebate for refunded orders
          sum(
            fragment(
              "CASE WHEN ? = 'refunded' THEN ? ELSE 0 END",
              o.status,
              o.total_rebate_amount
            )
          ),
          # Count of completed orders
          count(fragment("CASE WHEN ? = 'completed' THEN 1 ELSE NULL END", o.status)),
          # Count of refunded orders
          count(fragment("CASE WHEN ? = 'refunded' THEN 1 ELSE NULL END", o.status))
        },
        # Group by month
        group_by: [
          fragment("TO_CHAR(?, 'YYYY-MM')", o.date),
          fragment("TO_CHAR(?, 'Month')", o.date)
        ]
      )

    Repo.all(query)
    |> Enum.map(fn {month, month_name, total_orders, completed_rebate, rescinded_tokens,
                    completed_orders, refunded_orders} ->
      {month,
       %{
         month: month_name,
         total_orders: total_orders,
         total_tokens_rebate_completed: completed_rebate || Decimal.new(0),
         total_rescinded_tokens: rescinded_tokens || Decimal.new(0),
         completed_orders: completed_orders,
         refunded_orders: refunded_orders
       }}
    end)
    # Convert to a map for easy lookup
    |> Enum.into(%{})
  end

  def create_complete_order(%User{id: user_id}, %Offer{id: offer_id}, order_attrs) do
    case process_order_for_offer(%User{id: user_id}, %Offer{id: offer_id}, order_attrs) do
      {:ok, order} ->
        process_order_completion(order)
      {:error, changeset} ->
        {:error, changeset}
    end
  end
end
