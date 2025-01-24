defmodule RebuWebApiWeb.OfferJSON do

  alias RebuWebApi.Sales.Offer

  @doc """
  Renders a list of offers.
  """
  def index(%{offers: offers}) do
    %{data: for(offer <- offers, do: data(offer))}
  end

  @doc """
  Renders a single offer.
  """
  def show(%{offer: offer}) do
    %{data: data(offer)}
  end

  defp data(%Offer{} = offer) do
    %{
      id: offer.id,
      desc: offer.desc
    }
  end
end
