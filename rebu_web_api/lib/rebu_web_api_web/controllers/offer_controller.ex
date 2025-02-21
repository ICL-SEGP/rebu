defmodule RebuWebApiWeb.OfferController do
  use RebuWebApiWeb, :controller

  alias RebuWebApi.Sales
  alias RebuWebApi.Sales.Offer
  alias RebuWebApi.Accounts

  action_fallback RebuWebApiWeb.FallbackController

  def index(conn, _params) do
    offers = Sales.list_offers()
    render(conn, :index, offers: offers)
  end

 def create(
       conn,
       %{
         "affiliate_link" => link,
         "desc" => desc,
         "item_cost" => item_cost,
         "offer_end" => offer_end,
         "offer_started" => offer_started,
         "rebate_percentage" => rebate_percentage,
         "status" => status
       }
     ) do
  user = Guardian.Plug.current_resource(conn)

  # Convert string inputs to the correct types
  rebate_percentage_decimal = Decimal.new(rebate_percentage)
  item_cost_decimal = Decimal.new(item_cost)

  # Convert date strings to NaiveDateTime or DateTime
  offer_started_datetime = parse_date_string(offer_started)
  offer_end_datetime = parse_date_string(offer_end)

  case {offer_started_datetime, offer_end_datetime} do
    {{:ok, started_dt}, {:ok, ended_dt}} ->
      {:ok, %Offer{} = offer} =
        Sales.create_offer(user, %{
          affiliate_link: link,
          desc: desc,
          offer_end: ended_dt,
          offer_start: started_dt,
          rebate_percentage: rebate_percentage_decimal,
          status: String.to_atom(status), # Or status, if it is a string in the database
          item_cost: item_cost_decimal
        })

      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/offers/#{offer}")
      |> render(:show, offer: offer)

    {{:error, started_error}, _} ->
      conn
      |> put_status(:bad_request)
      |> json(%{errors: %{offer_started: started_error}})

    {_, {:error, ended_error}} ->
      conn
      |> put_status(:bad_request)
      |> json(%{errors: %{offer_end: ended_error}})
  end
end

def update(
       conn,
       %{
         "affiliate_link" => link,
         "desc" => desc,
         "item_cost" => item_cost,
         "offer_end" => offer_end,
         "offer_started" => offer_started,
         "rebate_percentage" => rebate_percentage,
         "status" => status,
         "id" => id
       }
     ) do
  user = Guardian.Plug.current_resource(conn)

  # Convert string inputs to the correct types
  rebate_percentage_decimal = Decimal.new(rebate_percentage)
  item_cost_decimal = Decimal.new(item_cost)

  # Convert date strings to NaiveDateTime or DateTime
  offer_started_datetime = parse_date_string(offer_started)
  offer_end_datetime = parse_date_string(offer_end)

  case {offer_started_datetime, offer_end_datetime} do
    {{:ok, started_dt}, {:ok, ended_dt}} ->
      case Sales.update_offer( Sales.get_offer!(id) ,%{
             affiliate_link: link,
             desc: desc,
             offer_end: ended_dt,
             offer_start: started_dt,
             rebate_percentage: rebate_percentage_decimal,
             status: String.to_atom(status), # Or status, if it is a string in the database
             item_cost: item_cost_decimal
           }) do
        {:ok, %Offer{} = offer} ->
          conn
          |> render(:show, offer: offer)

        {:error, changeset} ->
          conn
          |> put_status(:bad_request)
          |> json(%{errors: changeset})
      end

    {{:error, started_error}, _} ->
      conn
      |> put_status(:bad_request)
      |> json(%{errors: %{offer_started: started_error}})

    {_, {:error, ended_error}} ->
      conn
      |> put_status(:bad_request)
      |> json(%{errors: %{offer_end: ended_error}})
  end
end


defp parse_date_string(date_string) do
  case NaiveDateTime.from_iso8601(date_string <> "T00:00:00") do
    {:ok, datetime} -> {:ok, datetime}
    {:error, error} -> {:error, "Invalid date format: #{error}"}
  end
end
  def show(conn, %{"id" => id}) do
    offer = Sales.get_offer!(id)
    render(conn, :show, offer: offer)
  end

  # ph

  def delete(conn, %{"id" => id}) do
    offer = Sales.get_offer!(id)

    with {:ok, %Offer{}} <- Sales.delete_offer(offer) do
      send_resp(conn, :no_content, "")
    end
  end
end
