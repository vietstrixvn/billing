/**
 * Snowflake ID Generator for Node.js / TypeScript
 * Compatible with Go github.com/bwmarrin/snowflake
 *
 * Custom Epoch: 2020-01-01 00:00:00 UTC (1577836800000 ms)
 * Structure (64-bit int):
 *  - 41 bits: Timestamp in milliseconds since custom epoch
 *  - 10 bits: Node ID (0 - 1023)
 *  - 12 bits: Sequence number (0 - 4095)
 */

class SnowflakeGenerator {
  // Custom Epoch: 2020-01-01T00:00:00.000Z in ms
  private static readonly CUSTOM_EPOCH = BigInt(1577836800000);
  private static readonly NODE_BITS = BigInt(10);
  private static readonly SEQUENCE_BITS = BigInt(12);

  private static readonly MAX_NODE_ID = (BigInt(1) << SnowflakeGenerator.NODE_BITS) - BigInt(1); // 1023
  private static readonly MAX_SEQUENCE = (BigInt(1) << SnowflakeGenerator.SEQUENCE_BITS) - BigInt(1); // 4095

  private static readonly TIMESTAMP_SHIFT =
    SnowflakeGenerator.NODE_BITS + SnowflakeGenerator.SEQUENCE_BITS; // 22 bits
  private static readonly NODE_SHIFT = SnowflakeGenerator.SEQUENCE_BITS; // 12 bits

  private nodeId: bigint;
  private sequence: bigint = BigInt(0);
  private lastTimestamp: bigint = BigInt(-1);

  constructor(nodeId = 1) {
    const n = BigInt(nodeId);
    if (n < BigInt(0) || n > SnowflakeGenerator.MAX_NODE_ID) {
      throw new Error(`Snowflake node ID must be between 0 and ${SnowflakeGenerator.MAX_NODE_ID}`);
    }
    this.nodeId = n;
  }

  public nextId(): bigint {
    let timestamp = BigInt(Date.now());

    if (timestamp < this.lastTimestamp) {
      timestamp = this.lastTimestamp;
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + BigInt(1)) & SnowflakeGenerator.MAX_SEQUENCE;
      if (this.sequence === BigInt(0)) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = BigInt(Date.now());
        }
      }
    } else {
      this.sequence = BigInt(0);
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - SnowflakeGenerator.CUSTOM_EPOCH) << SnowflakeGenerator.TIMESTAMP_SHIFT) |
      (this.nodeId << SnowflakeGenerator.NODE_SHIFT) |
      this.sequence;

    return id;
  }

  public nextIdString(): string {
    return this.nextId().toString();
  }
}

// Default singleton instance with node ID 1
const defaultGenerator = new SnowflakeGenerator(1);

/**
 * Generate a new Snowflake ID as BigInt (64-bit integer)
 */
export const generateSnowflakeId = (): bigint => {
  return defaultGenerator.nextId();
};

/**
 * Generate a new Snowflake ID as string (Snowflake String representation)
 */
export const generateSnowflakeIdString = (): string => {
  return defaultGenerator.nextIdString();
};

export default SnowflakeGenerator;
