/*
Title: git_repository_2025-12-21T09-33-57-743Z.js
Description: 
Date: 12/21/2025, 3:03:57 PM
*/

// githubRepoService.js
// ===============================
// GitHub Repository Service
// ===============================

const GITHUB_API = "https://api.github.com";

/**
 * Create a new GitHub repository
 */
export async function createRepository(token, repoName, isPrivate = false, description = "") {
    const response = await fetch(`${GITHUB_API}/user/repos`, {
        method: "POST",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
            name: repoName,
            private: isPrivate,
            auto_init: true,
            description
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create repository");
    }

    return await response.json();
}

/**
 * Delete an existing GitHub repository
 */
export async function deleteRepository(token, owner, repo) {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
        method: "DELETE",
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github.v3+json"
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete repository");
    }

    return true;
}

/**
 * Update repository settings
 * (rename, description, visibility)
 */
export async function updateRepository(
    token,
    owner,
    repo,
    { newName, description, isPrivate }
) {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
        method: "PATCH",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
            name: newName,
            description,
            private: isPrivate
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update repository");
    }

    return await response.json();
}
