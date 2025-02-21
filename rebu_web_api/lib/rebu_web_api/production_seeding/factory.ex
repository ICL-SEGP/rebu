defmodule RebuWebApi.Factory do
  use ExMachina.Ecto, repo: RebuWebApi.Repo

  alias RebuWebApi.Factory
  alias RebuWebApi.Sales.{Offer, Order}
  alias RebuWebApi.Accounts.User
  alias RebuWebApi.Accounts.Admin

  @password "Password"

  # User Factory
  def user_factory do
    Map.merge(%User{}, user())
  end

  # Subtract that many days from today's date

  def user(attrs \\ %{}) do
    Map.merge(
      %{
        first_name: Faker.Person.first_name(),
        last_name: Faker.Person.last_name(),
        email: Faker.Internet.free_email(),
        token_balance: Decimal.new("0.0"),
        rescinded_tokens: Decimal.new("0.0"),
        locked_tokens: Decimal.new("0.0"),
        password: @password,
        hashed_password: Bcrypt.hash_pwd_salt(@password),
        role: :user,
        date_joined: days_ago(:rand.uniform(180))
      },
      attrs
    )
  end

  def admin_factory do
    Map.merge(%Admin{}, admin())
  end

  def admin(attrs \\ %{}) do
    Map.merge(
      %{
        first_name: Faker.Person.first_name(),
        last_name: Faker.Person.last_name(),
        email: Faker.Internet.free_email(),
        revenue: Decimal.new("0.0"),
        token_balance: Decimal.new("0.0"),
        locked_tokens: Decimal.new("0.0"),
        password: @password,
        hashed_password: Bcrypt.hash_pwd_salt(@password),
        role: :admin
      },
      attrs
    )
  end

  defp days_ago(n) do
    Timex.shift(Timex.now(), days: -n)
  end

  defp days_ahead(n), do: Timex.shift(Timex.now(), days: n)

  # Offer Factory
  @spec offer_factory() :: %{
          :__meta__ => any(),
          :__struct__ => any(),
          :admin => any(),
          :admin_id => any(),
          :affiliate_link => any(),
          :desc => any(),
          :id => any(),
          :inserted_at => any(),
          :offer_end => any(),
          :offer_start => any(),
          :order => any(),
          :rebate_percentage => any(),
          :status => any(),
          :updated_at => any(),
          optional(any()) => any()
        }
  def offer_factory do
    Map.merge(%Offer{}, offer())
  end

  def offer(attrs \\ %{}) do
    # Randomly pick a status
    status =
      case Map.has_key?(attrs, :status) do
        true -> attrs.status
        _ -> Enum.random([:active, :expired])
      end

    {offer_start, offer_end} =
      case status do
        # Scheduled: Both start and end dates are in the future
        :scheduled -> {days_ahead(:rand.uniform(30)), days_ahead(:rand.uniform(60) + 30)}
        # Active: Start date in the past, but still ongoing
        :active -> {days_ago(:rand.uniform(180)), days_ahead(:rand.uniform(30))}
        # Expired: Both start and end dates are in the past
        :expired -> {days_ago(:rand.uniform(180)), days_ago(:rand.uniform(30))}
      end

    {offer_start, offer_end} =
      if Timex.compare(offer_start, offer_end) == 1 do
        {offer_end, offer_start}
      else
        {offer_start, offer_end}
      end

    Map.merge(
      %{
        desc: Faker.Lorem.sentence(5),
        affiliate_link: Faker.Internet.url(),
        rebate_percentage: Decimal.from_float(:rand.uniform() * 10),
        offer_start: offer_start,
        offer_end: offer_end,
        item_cost: Decimal.new(:rand.uniform(250)),
        # Explicitly set the correct status
        status: status,
        admin: build(:admin)
      },
      attrs
    )
  end

  # Order Factory

  # Order Factory
  def order_factory do
    Map.merge(%Order{}, order())
  end

  def order(attrs \\ %{}) do
    now = Timex.now()

    # 1) Build or take a user from attrs
    user = Map.get(attrs, :user, build(:user))

    # Convert user.date_joined (a Date) to DateTime for Timex comparisons
    user_joined_dt =
      user.date_joined
      # or your desired timezone
      |> Timex.to_datetime("Etc/UTC")

    # 2) Gather offers (passed in or build them)
    all_offers = Map.get(attrs, :offers, [])

    # 3) Filter out only offers that are “viable”
    #    For example, we consider an offer “viable” if the user's join date <= offer_end
    #    so the user is around before the offer ends.
    viable_offers =
      Enum.filter(all_offers, fn offer ->
        # skip scheduled offers
        if offer.status not in [:active, :expired], do: false, else: true
      end)
      |> Enum.filter(fn offer ->
        Timex.compare(user_joined_dt, offer.offer_end) <= 0
      end)

    if viable_offers == [] do
      raise "No viable offers found for this user!"
    end

    # 4) Pick a random viable offer
    selected_offer = Enum.random(viable_offers)
    {offer_start, offer_end} = {selected_offer.offer_start, selected_offer.offer_end}

    # 5) The earliest date an order can happen is the LATER of (user joined date) or (offer_start)
    earliest_dt =
      case Timex.compare(offer_start, user_joined_dt) do
        # offer_start is after user joined => earliest is offer_start
        1 -> offer_start
        # user joined after the offer started => earliest is user_joined_dt
        _ -> user_joined_dt
      end

    # 6) Compute the final order date based on the offer’s status
    #    - If active: up to “now”
    #    - If expired: up to offer_end
    #    (but always starting at earliest_dt)
    order_date =
      case selected_offer.status do
        :active -> random_datetime_between(earliest_dt, now)
        :expired -> random_datetime_between(earliest_dt, offer_end)
      end

    # Decide final status based on how old the order is
    status =
      if Timex.diff(now, order_date, :days) > 14 do
        Enum.random([:completed, :refunded])
      else
        Enum.random([:in_progress, :completed, :refunded])
      end

    attrs = Map.drop(attrs, [:offers])

    # 7) Build the final struct
    Map.merge(
      %{
        status: status,
        total_rebate_amount: Decimal.mult(Decimal.new("8.129325432509786"), Decimal.new("157")),
        user: user,
        offers: [selected_offer],
        date: order_date
      },
      attrs
    )
  end

  # Utility: pick a random datetime between two Timex.DateTime values
  defp random_datetime_between(start_date, end_date) do
    if Timex.compare(start_date, end_date) == 1 do
      raise ArgumentError, "start_date (#{start_date}) cannot be after end_date (#{end_date})"
    end

    seconds_diff = Timex.diff(end_date, start_date, :seconds)
    random_offset = if seconds_diff > 0, do: :rand.uniform(seconds_diff), else: 0

    Timex.shift(start_date, seconds: random_offset)
  end
end
