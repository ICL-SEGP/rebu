# Find eligible builder and runner images on Docker Hub. We use Ubuntu/Debian
# instead of Alpine to avoid DNS resolution issues in production.
#
# https://hub.docker.com/r/hexpm/elixir/tags?page=1&name=ubuntu
# https://hub.docker.com/_/ubuntu?tab=tags
#
# This file is based on these images:
#
#   - https://hub.docker.com/r/hexpm/elixir/tags - for the build image
#   - https://hub.docker.com/_/debian?tab=tags&page=1&name=bullseye-20240926-slim - for the release image
#   - https://pkgs.org/ - resource for finding needed packages
#   - Ex: hexpm/elixir:1.17.3-erlang-27.1-debian-bullseye-20240926-slim
#
ARG ELIXIR_VERSION=1.18.2
ARG OTP_VERSION=27.1.3
ARG DEBIAN_VERSION=bullseye-20250113-slim

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="debian:${DEBIAN_VERSION}"

FROM rust:1.85.0-bullseye as rust_builder
# install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

WORKDIR /app
COPY native/solana_api ./
RUN cargo build --release


FROM ${BUILDER_IMAGE} AS elixir_builder

ENV RUSTLER_NO_COMPILE=1

ENV ERL_FLAGS="+JPperf true"

# install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force && \
  mix local.rebar --force

# set build ENV
ENV MIX_ENV="prod"

# install mix dependencies
COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# copy compile-time config files before we compile dependencies
# to ensure any relevant config change will trigger the dependencies
# to be re-compiled.
COPY config/config.exs config/${MIX_ENV}.exs config/sops_config.exs config/

RUN mix deps.compile

COPY priv priv

COPY lib lib

COPY assets assets

# compile assets
RUN mix assets.deploy

# copy rust binaries
COPY --from=rust_builder /app/target/release/libsolana_api.so priv/native/libsolana_api.so

# Compile the release
RUN mix compile

# Changes to config/runtime.exs don't require recompiling the code
COPY config/runtime.exs config/

COPY rel rel
RUN mix release

# start a new build stage so that the final image will only contain
# the compiled release and other runtime necessities
FROM ${RUNNER_IMAGE} AS runner

# Install dependencies needed for SOPS/Age and general runtime
RUN apt-get update -y && \
  apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates wget && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install SOPS (download the pre-built binary)
RUN wget -qO /usr/local/bin/sops https://github.com/mozilla/sops/releases/download/v3.7.3/sops-v3.7.3.linux && \
  chmod +x /usr/local/bin/sops

# Install Age (download the pre-built binary archive, extract and copy)
RUN wget -qO age.tar.gz https://github.com/FiloSottile/age/releases/download/v1.2.0/age-v1.2.0-linux-amd64.tar.gz && \
  tar -xzf age.tar.gz && \
  cp age/age /usr/local/bin/ && \
  cp age/age-keygen /usr/local/bin/ && \
  chmod +x /usr/local/bin/age /usr/local/bin/age-keygen && \
  rm -rf age age.tar.gz

WORKDIR "/app"
RUN chown nobody /app

# set runner environment variable
ENV MIX_ENV="prod"

# Copy the final release from the build stage
COPY --from=elixir_builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/rebu_web_api ./

USER nobody

CMD ["/app/bin/server"]