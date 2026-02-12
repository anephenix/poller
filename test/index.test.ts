// Dependencies
import assert from "node:assert";
import { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as path from "node:path";
import poller from "../src/index";
import type { ExtendedTimeout, Poller } from "../src/types";

// Used as the default for the unit tests
const pollerOptions = {
	interval: 1,
};

describe('require("poller")', () => {
	it("should return a function that can be used to poll a directory", (done) => {
		assert(typeof poller === "function");
		done();
	});
});

describe("poller(path);", () => {
	describe("when no folder path is passed", () => {
		it("should return an error, warning the developer that they need to pass a folder path", (done) => {
			poller(undefined as unknown as string, (err: Error | null) => {
				assert.notEqual(null, err);
				assert.equal(
					"You need to pass a folder path, you passed an argument with type: undefined",
					err?.message,
				);
				done();
			});
		});
	});

	describe("when a non-existent folder path is passed", () => {
		it("should return an error, warning the developer that the folder path does not exist", (done) => {
			const nonExistentFolder = "/tmp/non-existent";
			poller(nonExistentFolder, (err: Error | null) => {
				assert.notEqual(null, err);
				assert.equal(
					`This folder does not exist: ${nonExistentFolder}`,
					err?.message,
				);
				done();
			});
		});
	});

	describe("when an invalid folder path is passed", () => {
		it("should return an error, warning the developer that the folder path is not a folder", (done) => {
			const notaFolderPath = __filename;
			poller(notaFolderPath, (err: Error | null) => {
				assert.notEqual(null, err);
				assert.equal(
					`The path you passed is not a folder: ${notaFolderPath}`,
					err?.message,
				);
				done();
			});
		});
	});

	describe("when passed a valid folder path", () => {
		it("should return an event emitter", (done) => {
			const folderPath = path.join(__dirname, "./example");
			poller(
				folderPath,
				pollerOptions,
				(err: Error | null, poll: Poller | undefined) => {
					assert.equal(null, err);
					assert(poll instanceof EventEmitter);
					assert(typeof poll === "object");
					(poll as Poller).close();
					done();
				},
			);
		});

		describe("when a file is added within the folder", () => {
			afterEach((done) => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");

				fs.open(filePath, (error) => {
					if (!error) {
						return fs.unlink(filePath, done);
					} else {
						throw new Error(`The file path does not exist: ${filePath}`);
					}
				});
			});

			it("should emit an add event from the poll event emitter", (done) => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");
				poller(
					folderPath,
					pollerOptions,
					(err: Error | null, poll: Poller | undefined) => {
						assert.equal(null, err);
						(poll as Poller).on("add", (addedFilePath: string) => {
							assert.equal(filePath, addedFilePath);
							(poll as Poller).close();
							done();
						});

						fs.writeFile(filePath, "Hello World", (err) => {
							if (err) throw err;
						});
					},
				);
			});
		});

		describe("when a file is removed from within the folder", () => {
			it("should emit a remove event from the poll event emitter", (done) => {
				const folderPath = path.join(__dirname, "./example");
				const filePath = path.join(folderPath, "testFile.txt");

				fs.writeFile(filePath, "Hello World", (err) => {
					if (err) throw err;

					poller(
						folderPath,
						pollerOptions,
						(err: Error | null, poll: Poller | undefined) => {
							assert.equal(null, err);
							(poll as Poller).on("remove", (removedFilePath: string) => {
								assert.equal(filePath, removedFilePath);
								(poll as Poller).close();
								done();
							});

							fs.unlink(filePath, (err) => {
								if (err) done(err);
							});
						},
					);
				});
			});
		});

		describe("poll.close();", () => {
			it("should clear the timeout so that we are not polling the folder anymore", (done) => {
				const folderPath = path.join(__dirname, "./example");

				poller(folderPath, (err: Error | null, poll: Poller | undefined) => {
					assert.equal(null, err);
					poll?.on("add", () => {
						done(new Error("a file add was recorded when it should not have"));
					});
					poll?.close();
					assert.equal(null, poll?.timeout?._onTimeout);
					done();
				});
			});
		});
	});
});

describe("poller(path, {options});", () => {
	describe("interval option", () => {
		it("should allow the user to control the interval time between polling checks", (done) => {
			const folderPath = path.join(__dirname, "./example");

			poller(
				folderPath,
				{ interval: 50 },
				(err: Error | null, poll: Poller | undefined) => {
					assert.equal(null, err);
					poll?.on("add", () => {
						done(new Error("a file add was recorded when it should not have"));
					});
					const timeout = (poll as Poller)?.timeout as ExtendedTimeout;
					assert.equal(50, timeout._idleTimeout);
					poll?.close();
					done();
				},
			);
		});
	});

	describe("interval option", () => {
		it("should otherwise use a default value of 100ms if no option is passed", (done) => {
			const folderPath = path.join(__dirname, "./example");

			poller(folderPath, (err: Error | null, poll: Poller | undefined) => {
				assert.equal(null, err);
				poll?.on("add", () => {
					done(new Error("a file add was recorded when it should not have"));
				});
				const timeout = (poll as Poller)?.timeout as ExtendedTimeout;
				assert.equal(100, timeout._idleTimeout);
				poll?.close();
				done();
			});
		});
	});
});
