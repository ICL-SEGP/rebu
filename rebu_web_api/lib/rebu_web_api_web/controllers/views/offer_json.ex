defmodule RebuWebApiWeb.OfferJSON do
  alias RebuWebApiWeb.JSONHelpers

  @doc """
  Renders a list of offers.
  """
  def index(%{offers: offers}) do
    %{data: Enum.map(offers, &JSONHelpers.serialize_schema/1)}
  end

  @doc """
  Renders a single offer.
  """
  def show(%{offer: offer}) do
    %{data: JSONHelpers.serialize_schema(offer)}
  end
end
