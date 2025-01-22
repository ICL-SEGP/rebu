defmodule RebuWebApiWeb.Router do
  use RebuWebApiWeb, :router

  # pipeline :browser do
  #   plug :accepts, ["html"]
  #   plug :fetch_session
  #   plug :fetch_live_flash
  #   plug :put_root_layout, html: {RebuWebApiWeb.Layouts, :root}
  #   plug :protect_from_forgery
  #   plug :put_secure_browser_headers
  # end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  pipeline :auth do
    plug RebuWebApi.Auth.Pipeline
    plug RebuWebApi.Auth.SetAccountPlug
  end

  scope "/api", RebuWebApiWeb do
    pipe_through [:api, :auth]
    get "/", DefaultController, :default
    resources "/orders", OrderController, except: [:new, :edit]
  end

  scope "/api", RebuWebApiWeb do
    pipe_through :api
    post "/register", AuthController, :register
    post "/sign-in", AuthController, :sign_in
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  # if Application.compile_env(:rebu_web_api, :dev_routes) do
  #   # If you want to use the LiveDashboard in production, you should put
  #   # it behind authentication and allow only admins to access it.
  #   # If your application does not have an admins-only section yet,
  #   # you can use Plug.BasicAuth to set up some basic authentication
  #   # as long as you are also using SSL (which you should anyway).
  #   import Phoenix.LiveDashboard.Router

  #   scope "/dev" do
  #     pipe_through :browser

  #     live_dashboard "/dashboard", metrics: RebuWebApiWeb.Telemetry
  #     forward "/mailbox", Plug.Swoosh.MailboxPreview
  #   end
  # end
end
