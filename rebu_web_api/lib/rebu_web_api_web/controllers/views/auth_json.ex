defmodule RebuWebApiWeb.AuthJSON do
  alias RebuWebApiWeb.JSONHelpers

  @doc """
  Returns auth success response with token.
  """
  def auth_success(%{user: user, token: token}) do
    %{data: Map.put(JSONHelpers.serialize_schema(user), :token, token)}
  end

  @doc """
  Returns a successful sign-out response.
  """
  def signed_out(%{}) do
    %{message: "Signed out successfully.", status: "success"}
  end

  @doc """
  Returns user balance.
  """
  def balances(%{balances: balances}) do
    balances
  end

  @doc """
  Returns a standardized error response.
  """
  def error(%{error: error}) do
    JSONHelpers.error_response(error)
  end
end
