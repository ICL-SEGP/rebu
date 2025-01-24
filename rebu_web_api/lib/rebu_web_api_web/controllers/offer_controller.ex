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

  def create(conn, %{"offer" => offer_params}) do
    with true <- Accounts.is_admin(conn.assigns.user),
         {:ok, %Offer{} = offer} <- Sales.create_rebate_offer(conn.assigns.user, offer_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/offers/#{offer}")
      |> render(:show, offer: offer)
    end
  end

  def show(conn, %{"id" => id}) do
    offer = Sales.get_offer!(id)
    render(conn, :show, offer: offer)
  end

  def update(conn, %{"id" => id, "offer" => offer_params}) do
    offer = Sales.get_offer!(id)

    with {:ok, %Offer{} = offer} <- Sales.update_offer(offer, offer_params) do
      render(conn, :show, offer: offer)
    end
  end

  def delete(conn, %{"id" => id}) do
    offer = Sales.get_offer!(id)

    with {:ok, %Offer{}} <- Sales.delete_offer(offer) do
      send_resp(conn, :no_content, "")
    end
  end
end
