defmodule RebuWebApi.Auth.Pipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :rebu_web_api,
    module: RebuWebApi.Auth.Guardian,
    error_handler: RebuWebApi.Auth.ErrorHandler

  # If there is an authorization header, restrict it to an access token and validate it
  plug Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"}
  # Load the user if the verifications worked
  plug Guardian.Plug.LoadResource, allow_blank: true
  plug Guardian.Plug.EnsureAuthenticated
end
