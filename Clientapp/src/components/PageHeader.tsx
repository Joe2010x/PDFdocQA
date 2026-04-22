function PageHeader() {
  return (
    <section className="page-header">
      <div>
        <p className="section-label">Document Q&A</p>
        <h1>Ask questions against your backend service.</h1>
        <p className="intro-copy">
          Enter a topic and prompt, then send the request to the ASP.NET Core
          API. The response panel shows the model output and the current API
          status.
        </p>
      </div>

      <div className="header-links">
        <a className="secondary-link" href="http://localhost:5000/swagger">
          Swagger UI
        </a>
        <a className="secondary-link" href="http://localhost:5000/openapi/v1.json">
          OpenAPI schema
        </a>
      </div>
    </section>
  )
}

export default PageHeader
