module.exports = {
  ScrapeJob: class ScrapeJob {
    constructor(pageId, url) {
      this.pageId = pageId;
      this.url = url;
    }
  },

  ScrapeResult: class ScrapeResult {
    constructor(title, finalUrl, links) {
      this.title = title;
      this.finalUrl = finalUrl;
      this.links = links;
    }
  },

  Pagination: class Pagination {
    constructor(page, limit, total, totalPages) {
      this.page = page;
      this.limit = limit;
      this.total = total;
      this.totalPages = totalPages;
    }
  },

  UserResponse: class UserResponse {
    constructor(id, username, email, createdAt) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.createdAt = createdAt;
    }
  },

  LinkResponse: class LinkResponse {
    constructor(id, href, name, createdAt) {
      this.id = id;
      this.href = href;
      this.name = name;
      this.createdAt = createdAt;
    }
  },

  PageResponse: class PageResponse {
    constructor(
      id,
      url,
      finalUrl,
      title,
      status,
      linkCount,
      queuedAt,
      startedAt,
      finishedAt,
      error,
      createdAt
    ) {
      this.id = id;
      this.url = url;
      this.finalUrl = finalUrl;
      this.title = title;
      this.status = status;
      this.linkCount = linkCount;
      this.queuedAt = queuedAt;
      this.startedAt = startedAt;
      this.finishedAt = finishedAt;
      this.error = error;
      this.createdAt = createdAt;
    }
  },

  PagesResponse: class PagesResponse {
    constructor(pages, pagination) {
      this.pages = pages;
      this.pagination = pagination;
    }
  },

  PageDetailsResponse: class PageDetailsResponse {
    constructor(page, links, pagination) {
      this.page = page;
      this.links = links;
      this.pagination = pagination;
    }
  },

  AuthResponse: class AuthResponse {
    constructor(token, user) {
      this.token = token;
      this.user = user;
    }
  },

  LoginCredentials: class LoginCredentials {
    constructor(email, password) {
      this.email = email;
      this.password = password;
    }
  },

  RegisterCredentials: class RegisterCredentials {
    constructor(username, email, password) {
      this.username = username;
      this.email = email;
      this.password = password;
    }
  },
};
