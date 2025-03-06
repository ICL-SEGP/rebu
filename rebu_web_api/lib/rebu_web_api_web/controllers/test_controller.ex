defmodule RebuWebApiWeb.TestController do
  use RebuWebApiWeb, :controller

  action_fallback RebuWebApiWeb.FallbackController

  def default(conn, _params) do
    text(conn, "The Real Deal API is LIVE")
  end
end
