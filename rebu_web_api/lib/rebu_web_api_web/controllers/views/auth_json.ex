defmodule RebuWebApiWeb.AuthJSON do
  alias RebuWebApiWeb.JSONHelpers

  @doc """
  Returns auth success response with token.
  """

  # def user(%{user: user, token: token}) do
  #   %{user: user, token: token, mint: RebuWebApi.SolanaApi.get_mint_str()}
  # end

  def user(%{user: user, token: token}) do
    %{user: user, token: token}
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
