defmodule RebuWebApiWeb.DefaultController do
  use RebuWebApiWeb, :controller

  action_fallback RebuWebApiWeb.FallbackController

  def default(conn, _params) do
    text(conn, "The Real Deal API is LIVE - #{Mix.env()}")
  end
end
