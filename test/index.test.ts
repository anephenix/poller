// Dependencies
import assert from "node:assert";
import { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, describe, it } from "vitest";
import poller from "../src/index";
import type { ExtendedTimeout, Poller } from "../src/types";

// Used as the default for the unit tests
const pollerOptions = {
	interval: 1,
};

describe('require("poller")', () => {
	it("should return a function that can be used to poll a directory", () => {
		assert(typeof poller === "function");
	});
});

describe("poller(path);", () => {
	describe("when no folder path is passed", () => {
		it("should return an error, warning the developer that they need to pass a folder path", () => {
			poller(undefined as unknown as string, (err: Error | null) => {
				assert.notEqual(null, err);
				assert.equal(
					"You need to pass a folder path, you passed an argument with type: undefined",
					err?.message,
				);
			});
		});
	});

	describe("when a non-existent folder path is passed", () => {
		it("should return an error, warning the developer that the folder path does not exist", () => {
			const nonExistentFolder = "/tmp/non-existent";
			return new Promise<void>((resolve, reject) => {
				poller(nonExistentFolder, (err: Error | null) => {
					try {
						assert.notEqual(null, err);
						assert.equal(
							`This folder does not exist: ${nonExistentFolder}`,
							err?.message,
						);
						resolve();
					} catch (error) {
						reject(error);
					}
				});
			});
		});
	});

	describe("when an invalid folder path is passed", () => {
		it("should return an error, warning the developer that the folder path is not a folder", () => {
			const notaFolderPath = __filename;
			return new Promise<void>((resolve, reject) => {
				poller(notaFolderPath, (err: Error | null) => {
					try {
						assert.notEqual(null, err);
						assert.equal(
							`The path you passed is not a folder: ${notaFolderPath}`,
							err?.message,
						);
						resolve();
					} catch (error) {
						reject(error);
					}
				});
			});
		});
	});

	describe("when passed a valid folder path", () => {
		it("should return an event emitter", () => {
			const folderPath = path.join(__dirname, "./example");
			return new Promise<void>((resolve, reject) => {
				poller(
					folderPath,
					pollerOptions,
					(err: Error | null, poll: Poller | undefined) => {
						try {
							assert.equal(null, err);
							assert(poll instanceof EventEmitter);
							assert(typeof poll === "object");
							(poll as Poller).close();
							resolve();
						} catch (error) {
							reject(error);
						}
					},
				);
			});
		});

		describe("when a file is added within the folder", () => {
			afterEach(() => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");

				return new Promise<void>((resolve, reject) => {
					fs.open(filePath, (error) => {
						if (!error) {
							fs.unlink(filePath, (err) => {
								if (err) reject(err);
								else resolve();
							});
						} else {
							reject(new Error(`The file path does not exist: ${filePath}`));
						}
					});
				});
			});

			it("should emit an add event from the poll event emitter", () => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");
				return new Promise<void>((resolve, reject) => {
					poller(
						folderPath,
						pollerOptions,
						(err: Error | null, poll: Poller | undefined) => {
							try {
								assert.equal(null, err);
								(poll as Poller).on("add", (addedFilePath: string) => {
									try {
										assert.equal(filePath, addedFilePath);
										(poll as Poller).close();
										resolve();
									} catch (error) {
										reject(error);
									}
								});

								fs.writeFile(filePath, "Hello World", (err) => {
									if (err) reject(err);
								});
							} catch (error) {
								reject(error);
							}
						},
					);
				});
			});
		});

		describe("when a file is added within the folder under rapid polling", () => {
			afterEach(() => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");

				return new Promise<void>((resolve, reject) => {
					fs.open(filePath, (error) => {
						if (!error) {
							fs.unlink(filePath, (err) => {
								if (err) reject(err);
								else resolve();
							});
						} else {
							reject(new Error(`The file path does not exist: ${filePath}`));
						}
					});
				});
			});

			it("should emit an add event exactly once, not twice (race condition guard)", () => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");
				return new Promise<void>((resolve, reject) => {
					poller(
						folderPath,
						{ interval: 1 },
						(err: Error | null, poll: Poller | undefined) => {
							try {
								assert.equal(null, err);
								let addCount = 0;
								(poll as Poller).on("add", (addedFilePath: string) => {
									if (addedFilePath === filePath) addCount++;
								});

								fs.writeFile(filePath, "Hello World", (err) => {
									if (err) return reject(err);
									// Wait long enough for multiple poll cycles to fire
									setTimeout(() => {
										(poll as Poller).close();
										try {
											assert.equal(
												1,
												addCount,
												`Expected add event once, got ${addCount}`,
											);
											resolve();
										} catch (error) {
											reject(error);
										}
									}, 100);
								});
							} catch (error) {
								reject(error);
							}
						},
					);
				});
			});
		});

		describe("when a file is removed from within the folder", () => {
			it("should emit a remove event from the poll event emitter", () => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");

				return new Promise<void>((resolve, reject) => {
					fs.writeFile(filePath, "Hello World", (err) => {
						if (err) return reject(err);

						poller(
							folderPath,
							pollerOptions,
							(err: Error | null, poll: Poller | undefined) => {
								try {
									assert.equal(null, err);
									(poll as Poller).on("remove", (removedFilePath: string) => {
										try {
											assert.equal(filePath, removedFilePath);
											(poll as Poller).close();
											resolve();
										} catch (error) {
											reject(error);
										}
									});

									fs.unlink(filePath, (err) => {
										if (err) reject(err);
									});
								} catch (error) {
									reject(error);
								}
							},
						);
					});
				});
			});
		});

		describe("poll.close();", () => {
			it("should clear the timeout so that we are not polling the folder anymore", () => {
				const folderPath = path.join(__dirname, "./example");

				return new Promise<void>((resolve, reject) => {
					poller(folderPath, (err: Error | null, poll: Poller | undefined) => {
						try {
							assert.equal(null, err);
							poll?.on("add", () => {
								reject(
									new Error("a file add was recorded when it should not have"),
								);
							});
							poll?.close();
							assert.equal(null, poll?.timeout?._onTimeout);
							resolve();
						} catch (error) {
							reject(error);
						}
					});
				});
			});
		});
	});
});

describe("poller(path, {options});", () => {
	describe("interval option", () => {
		it("should allow the user to control the interval time between polling checks", () => {
			const folderPath = path.join(__dirname, "./example");

			return new Promise<void>((resolve, reject) => {
				poller(
					folderPath,
					{ interval: 50 },
					(err: Error | null, poll: Poller | undefined) => {
						try {
							assert.equal(null, err);
							poll?.on("add", () => {
								reject(
									new Error("a file add was recorded when it should not have"),
								);
							});
							const timeout = (poll as Poller)?.timeout as ExtendedTimeout;
							assert.equal(50, timeout._idleTimeout);
							poll?.close();
							resolve();
						} catch (error) {
							reject(error);
						}
					},
				);
			});
		});
	});

	describe("interval option", () => {
		it("should otherwise use a default value of 100ms if no option is passed", () => {
			const folderPath = path.join(__dirname, "./example");

			return new Promise<void>((resolve, reject) => {
				poller(folderPath, (err: Error | null, poll: Poller | undefined) => {
					try {
						assert.equal(null, err);
						poll?.on("add", () => {
							reject(
								new Error("a file add was recorded when it should not have"),
							);
						});
						const timeout = (poll as Poller)?.timeout as ExtendedTimeout;
						assert.equal(100, timeout._idleTimeout);
						poll?.close();
						resolve();
					} catch (error) {
						reject(error);
					}
				});
			});
		});
	});

	describe("promise interface", () => {
		it("should resolve with a Poller when called without a callback", async () => {
			const folderPath = path.join(__dirname, "./example");
			const poll = await poller(folderPath);
			assert(poll instanceof EventEmitter);
			poll.close();
		});

		it("should resolve with a Poller when called with options but no callback", async () => {
			const folderPath = path.join(__dirname, "./example");
			const poll = await poller(folderPath, { interval: 50 });
			assert(poll instanceof EventEmitter);
			const timeout = poll.timeout as ExtendedTimeout;
			assert.equal(50, timeout._idleTimeout);
			poll.close();
		});

		it("should reject when the folder does not exist", async () => {
			const nonExistentFolder = "/tmp/non-existent";
			await assert.rejects(
				() => poller(nonExistentFolder),
				(err: Error) => {
					assert.equal(
						`This folder does not exist: ${nonExistentFolder}`,
						err.message,
					);
					return true;
				},
			);
		});

		it("should reject when the path is not a folder", async () => {
			await assert.rejects(
				() => poller(__filename),
				(err: Error) => {
					assert.equal(
						`The path you passed is not a folder: ${__filename}`,
						err.message,
					);
					return true;
				},
			);
		});
	});

	describe("recursive option", () => {
		const folderPath = path.join(__dirname, "./example");
		const subDir = path.join(folderPath, "subdir");
		const nestedFile = path.join(subDir, "nested.txt");

		afterEach(() => {
			return new Promise<void>((resolve, reject) => {
				fs.rm(subDir, { recursive: true, force: true }, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		});

		it("should emit an add event for a file added inside a subdirectory", () => {
			return new Promise<void>((resolve, reject) => {
				poller(
					folderPath,
					{ interval: 1, recursive: true },
					(err: Error | null, poll: Poller | undefined) => {
						try {
							assert.equal(null, err);
							(poll as Poller).on("add", (addedFilePath: string) => {
								if (addedFilePath === nestedFile) {
									(poll as Poller).close();
									resolve();
								}
							});

							fs.mkdir(subDir, (err) => {
								if (err) return reject(err);
								fs.writeFile(nestedFile, "nested content", (err) => {
									if (err) reject(err);
								});
							});
						} catch (error) {
							reject(error);
						}
					},
				);
			});
		});

		it("should emit a remove event for a file removed from inside a subdirectory", () => {
			return new Promise<void>((resolve, reject) => {
				fs.mkdir(subDir, (err) => {
					if (err) return reject(err);
					fs.writeFile(nestedFile, "nested content", (err) => {
						if (err) return reject(err);

						poller(
							folderPath,
							{ interval: 1, recursive: true },
							(err: Error | null, poll: Poller | undefined) => {
								try {
									assert.equal(null, err);
									(poll as Poller).on("remove", (removedFilePath: string) => {
										if (removedFilePath === nestedFile) {
											(poll as Poller).close();
											resolve();
										}
									});

									fs.unlink(nestedFile, (err) => {
										if (err) reject(err);
									});
								} catch (error) {
									reject(error);
								}
							},
						);
					});
				});
			});
		});
	});
});
