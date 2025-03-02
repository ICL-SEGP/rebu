defmodule RebuWebApiWeb.ErrorResponse.Unauthorized do
  defexception message: "Unauthorized", plug_status: 401
end

defmodule RebuWebApiWeb.ErrorResponse.Forbidden do
  defexception message: "You do not have access to this resource.", plug_status: 403
end

defmodule RebuWebApiWeb.ErrorResponse.NotFound do
  defexception message: "Not Found", plug_status: 404
end
