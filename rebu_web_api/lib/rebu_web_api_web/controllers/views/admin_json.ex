defmodule RebuWebApiWeb.AdminJSON do
  alias RebuWebApiWeb.JSONHelpers

  def get_users(%{users: users}) do
    %{users: Enum.map(users, &JSONHelpers.serialize_schema/1)}
  end
end
